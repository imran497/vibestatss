'use client';

import { useState, useEffect } from 'react';
import { Layers, GitBranch, Loader2 } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Button } from '@/app/components/ui/button';
import TemplateSelectorModal from '@/app/creator/common/TemplateSelectorModal';
import TemplateCarousel from '@/app/creator/common/TemplateCarousel';
import ColorPicker from '@/app/components/common/ColorPicker';

// High-quality Google Font options
const FONT_FAMILY_OPTIONS = [
  // Modern Sans-Serif
  { value: 'var(--font-inter), sans-serif', label: 'Inter', category: 'Modern' },
  { value: 'var(--font-poppins), sans-serif', label: 'Poppins', category: 'Modern' },
  { value: 'var(--font-montserrat), sans-serif', label: 'Montserrat', category: 'Modern' },
  { value: 'var(--font-outfit), sans-serif', label: 'Outfit', category: 'Modern' },
  { value: 'var(--font-dm-sans), sans-serif', label: 'DM Sans', category: 'Modern' },
  { value: 'var(--font-work-sans), sans-serif', label: 'Work Sans', category: 'Modern' },
  { value: 'var(--font-plus-jakarta), sans-serif', label: 'Plus Jakarta Sans', category: 'Modern' },

  // Elegant Serif
  { value: 'var(--font-playfair), serif', label: 'Playfair Display', category: 'Elegant' },
  { value: 'var(--font-merriweather), serif', label: 'Merriweather', category: 'Elegant' },
  { value: 'var(--font-lora), serif', label: 'Lora', category: 'Elegant' },

  // Bold Display
  { value: 'var(--font-bebas-neue), sans-serif', label: 'Bebas Neue', category: 'Bold' },
  { value: 'var(--font-oswald), sans-serif', label: 'Oswald', category: 'Bold' },
  { value: 'var(--font-righteous), sans-serif', label: 'Righteous', category: 'Bold' },

  // Monospace
  { value: 'var(--font-jetbrains-mono), monospace', label: 'JetBrains Mono', category: 'Code' },
  { value: 'var(--font-space-mono), monospace', label: 'Space Mono', category: 'Code' },

  // System Fallbacks
  { value: 'system-ui, -apple-system, sans-serif', label: 'System Default', category: 'System' },
];

// Color scheme presets
const COLOR_PRESETS = {
  github: {
    name: 'GitHub',
    level0: '#161b22',
    level1: '#0e4429',
    level2: '#006d32',
    level3: '#26a641',
    level4: '#39d353',
  },
  heat: {
    name: 'Heat',
    level0: '#1a1a1a',
    level1: '#4a1a1a',
    level2: '#8b2e00',
    level3: '#d45500',
    level4: '#ff7700',
  },
  ocean: {
    name: 'Ocean',
    level0: '#0a192f',
    level1: '#112240',
    level2: '#1e3a5f',
    level3: '#2e5a8a',
    level4: '#64b5f6',
  },
  forest: {
    name: 'Forest',
    level0: '#0d1b0d',
    level1: '#1b3d1b',
    level2: '#2e5e2e',
    level3: '#4a8f4a',
    level4: '#7bc67b',
  },
  sunset: {
    name: 'Sunset',
    level0: '#1a1a2e',
    level1: '#4a2c5e',
    level2: '#7a4e8e',
    level3: '#d97ba9',
    level4: '#ffa3c7',
  },
};

// Generate a 5-level color palette from a base color and background
function generateColorPalette(baseColor, backgroundColor) {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = Math.round(Math.max(0, Math.min(255, x))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  // Interpolate between two colors
  const interpolateColor = (color1, color2, factor) => {
    return {
      r: color1.r + (color2.r - color1.r) * factor,
      g: color1.g + (color2.g - color1.g) * factor,
      b: color1.b + (color2.b - color1.b) * factor,
    };
  };

  const bg = hexToRgb(backgroundColor);
  const base = hexToRgb(baseColor);

  // Generate 5 levels
  // level0: very close to background (10% towards base color)
  // level1: 30% towards base color
  // level2: 50% towards base color
  // level3: 75% towards base color
  // level4: full base color with slight brightness boost

  const level0 = interpolateColor(bg, base, 0.1);
  const level1 = interpolateColor(bg, base, 0.3);
  const level2 = interpolateColor(bg, base, 0.5);
  const level3 = interpolateColor(bg, base, 0.75);

  // level4 is the base color with a slight brightness boost
  const brightnessBoost = 1.15;
  const level4 = {
    r: Math.min(255, base.r * brightnessBoost),
    g: Math.min(255, base.g * brightnessBoost),
    b: Math.min(255, base.b * brightnessBoost),
  };

  return {
    level0: rgbToHex(level0.r, level0.g, level0.b),
    level1: rgbToHex(level1.r, level1.g, level1.b),
    level2: rgbToHex(level2.r, level2.g, level2.b),
    level3: rgbToHex(level3.r, level3.g, level3.b),
    level4: rgbToHex(level4.r, level4.g, level4.b),
  };
}

export default function LeftPanel({ config, setConfig, templateId, templateName }) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customBaseColor, setCustomBaseColor] = useState('#39d353');

  const updateConfig = (field, value) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };

      // If cellSize changes, clamp cornerRadius to max cellSize/2
      if (field === 'cellSize') {
        const maxRadius = Math.floor(value / 2);
        if (newConfig.cornerRadius > maxRadius) {
          newConfig.cornerRadius = maxRadius;
        }
      }

      // If background color changes and color scheme is custom, regenerate palette
      if (field === 'backgroundColor' && prev.colorScheme === 'custom') {
        const palette = generateColorPalette(customBaseColor, value);
        newConfig.customColors = palette;
      }

      return newConfig;
    });
  };

  const handleFetchContributions = async () => {
    if (!config.username.trim()) {
      setError('Please enter a GitHub username');
      return;
    }

    // Check if we already have data for this username
    if (config.contributionData && config.contributionData.username === config.username) {
      // Data already cached for this username, no need to fetch
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Always fetch 365 days of data
      const response = await fetch(
        `/api/github/contributions?username=${encodeURIComponent(config.username)}&timeRange=365`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch contributions');
      }

      setConfig(prev => ({ ...prev, contributionData: data }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyColorPreset = (presetKey) => {
    if (presetKey === 'custom') {
      // Generate custom palette based on current base color and background
      const palette = generateColorPalette(customBaseColor, config.backgroundColor);
      setConfig(prev => ({
        ...prev,
        colorScheme: 'custom',
        customColors: palette,
      }));
    } else {
      const preset = COLOR_PRESETS[presetKey];
      setConfig(prev => ({
        ...prev,
        colorScheme: presetKey,
        customColors: {
          level0: preset.level0,
          level1: preset.level1,
          level2: preset.level2,
          level3: preset.level3,
          level4: preset.level4,
        },
      }));
    }
  };

  const handleCustomBaseColorChange = (color) => {
    setCustomBaseColor(color);
    // If custom scheme is active, regenerate the palette
    if (config.colorScheme === 'custom') {
      const palette = generateColorPalette(color, config.backgroundColor);
      setConfig(prev => ({
        ...prev,
        customColors: palette,
      }));
    }
  };

  return (
    <>
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentTemplate={templateId}
      />

      <div className="space-y-6">
        {/* Template Carousel */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-sm flex items-center gap-2">
              <Layers size={16} className="text-primary" /> Template
            </Label>
            <button
              onClick={() => setIsTemplateModalOpen(true)}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Show all
            </button>
          </div>
          <TemplateCarousel currentTemplate={templateId} />
        </div>

        {/* GitHub Data Section */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <GitBranch size={16} />
            GitHub Data
          </h3>

          <div className="space-y-2">
            <Label htmlFor="username">GitHub Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username (e.g., torvalds)"
              value={config.username}
              onChange={(e) => updateConfig('username', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleFetchContributions();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeRange">Time Range</Label>
            <Select
              value={config.timeRange}
              onValueChange={(value) => {
                let newCellSize = 14;
                switch (value) {
                  case 'month': newCellSize = 28; break;
                  case '3month': newCellSize = 22; break;
                  case '6month': newCellSize = 15; break;
                  case 'year': newCellSize = 15; break;
                }

                setConfig(prev => ({
                  ...prev,
                  timeRange: value,
                  cellSize: newCellSize,
                  cornerRadius: Math.min(prev.cornerRadius, Math.floor(newCellSize / 2))
                }));
              }}
            >
              <SelectTrigger id="timeRange">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Current Month (Large)</SelectItem>
                <SelectItem value="3month">Last 3 Months (Medium)</SelectItem>
                <SelectItem value="6month">Last 6 Months (Standard)</SelectItem>
                <SelectItem value="year">Current Year (Standard)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleFetchContributions}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching...
              </>
            ) : (
              'Fetch Contributions'
            )}
          </Button>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {config.contributionData && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium">
                ✓ Loaded {config.contributionData.totalContributions} contributions
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {config.contributionData.weekCount} weeks
              </p>
            </div>
          )}
        </div>

        {/* Animation Settings */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-semibold text-sm">Animation</h3>

          <div className="space-y-2">
            <Label htmlFor="animationType">Animation Type</Label>
            <Select
              value={config.animationType}
              onValueChange={(value) => updateConfig('animationType', value)}
            >
              <SelectTrigger id="animationType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sequential">Sequential (Left to Right)</SelectItem>
                <SelectItem value="column">Column by Column</SelectItem>
                <SelectItem value="all-at-once">All at Once</SelectItem>
                <SelectItem value="random">Random Cells</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Styling Options */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-semibold text-sm">Styling</h3>

          {/* Color Scheme Presets */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Color Scheme</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(COLOR_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyColorPreset(key)}
                  className={`h-12 rounded-md border-2 transition-all relative overflow-hidden ${config.colorScheme === key
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                    }`}
                  title={preset.name}
                >
                  <div className="flex gap-[1px] h-full">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="flex-1"
                        style={{ backgroundColor: preset[`level${level}`] }}
                      />
                    ))}
                  </div>
                </button>
              ))}
              {/* Custom Color Scheme Button */}
              <button
                type="button"
                onClick={() => applyColorPreset('custom')}
                className={`h-12 rounded-md border-2 transition-all relative overflow-hidden flex items-center justify-center ${config.colorScheme === 'custom'
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50'
                  }`}
                title="Custom"
              >
                {config.colorScheme === 'custom' ? (
                  <div className="flex gap-[1px] h-full w-full">
                    {[0, 1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className="flex-1"
                        style={{ backgroundColor: config.customColors[`level${level}`] }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-muted-foreground">Custom</span>
                )}
              </button>
            </div>

            {/* Custom Base Color Picker */}
            {config.colorScheme === 'custom' && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border">
                <Label className="text-xs text-muted-foreground">Base Color</Label>
                <div className="flex items-center gap-3">
                  <ColorPicker
                    color={customBaseColor}
                    onChange={handleCustomBaseColorChange}
                  />
                  <span className="text-xs text-muted-foreground">
                    Palette auto-generates based on background
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Background</Label>
              <ColorPicker
                color={config.backgroundColor}
                onChange={(color) => updateConfig('backgroundColor', color)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Text Color</Label>
              <ColorPicker
                color={config.textColor}
                onChange={(color) => updateConfig('textColor', color)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font">Font</Label>
            <Select
              value={config.font}
              onValueChange={(value) => updateConfig('font', value)}
            >
              <SelectTrigger id="font">
                <SelectValue>
                  <span style={{ fontFamily: config.font }}>
                    {FONT_FAMILY_OPTIONS.find(f => f.value === config.font)?.label || 'Default (System)'}
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILY_OPTIONS.map(font => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cellSize">Cell Size</Label>
              <span className="text-sm text-muted-foreground">{config.cellSize}px</span>
            </div>
            <input
              id="cellSize"
              type="range"
              value={config.cellSize}
              onChange={(e) => updateConfig('cellSize', parseInt(e.target.value))}
              min="8"
              max="30"
              step="1"
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cellGap">Cell Gap</Label>
              <span className="text-sm text-muted-foreground">{config.cellGap}px</span>
            </div>
            <input
              id="cellGap"
              type="range"
              value={config.cellGap}
              onChange={(e) => updateConfig('cellGap', parseInt(e.target.value))}
              min="2"
              max="6"
              step="1"
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="cornerRadius">Corner Radius</Label>
              <span className="text-sm text-muted-foreground">{config.cornerRadius}px</span>
            </div>
            <input
              id="cornerRadius"
              type="range"
              value={config.cornerRadius}
              onChange={(e) => updateConfig('cornerRadius', parseInt(e.target.value))}
              min="0"
              max={Math.floor(config.cellSize / 2)}
              step="1"
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        {/* Visual Options */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-semibold text-sm">Visual Elements</h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="showUsername">Show Username</Label>
              <Switch
                id="showUsername"
                checked={config.showUsername}
                onCheckedChange={(checked) => updateConfig('showUsername', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showTotalCount">Show Total Count</Label>
              <Switch
                id="showTotalCount"
                checked={config.showTotalCount}
                onCheckedChange={(checked) => updateConfig('showTotalCount', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showMonthLabels">Show Month Labels</Label>
              <Switch
                id="showMonthLabels"
                checked={config.showMonthLabels}
                onCheckedChange={(checked) => updateConfig('showMonthLabels', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showDayLabels">Show Day Labels</Label>
              <Switch
                id="showDayLabels"
                checked={config.showDayLabels}
                onCheckedChange={(checked) => updateConfig('showDayLabels', checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
