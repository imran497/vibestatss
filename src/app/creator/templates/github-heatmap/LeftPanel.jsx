'use client';

import { useState, useEffect } from 'react';
import { Layers, ChevronRight, GitBranch, Loader2 } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Button } from '@/app/components/ui/button';
import TemplateSelectorModal from '@/app/creator/common/TemplateSelectorModal';
import ColorPicker from '@/app/components/common/ColorPicker';

// Font options (matching text video template)
const FONT_FAMILY_OPTIONS = [
  { value: 'system-ui, -apple-system, sans-serif', label: 'Default (System)' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Helvetica, sans-serif', label: 'Helvetica' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
  { value: 'Courier New, monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: 'Impact, sans-serif', label: 'Impact' },
  { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
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

export default function LeftPanel({ config, setConfig, templateId, templateName }) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  };

  return (
    <>
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentTemplate={templateId}
      />

      <div className="space-y-6">
        {/* Template Type Selection */}
        <div className="space-y-2">
          <Label className="font-medium flex items-center gap-2">
            <Layers size={16} className="text-primary" /> Template Type
          </Label>
          <button
            onClick={() => setIsTemplateModalOpen(true)}
            className="w-full bg-muted hover:bg-muted/80 p-3 rounded-lg flex items-center justify-between transition-colors group"
          >
            <span className="font-medium">{templateName}</span>
            <ChevronRight size={16} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Template Info */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{templateName}</h2>
          <p className="text-sm text-muted-foreground">
            Animated GitHub contribution heatmap with bubble pop effects
          </p>
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

        {/* Color Scheme */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-semibold text-sm">Color Scheme</h3>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Presets</Label>
            <div className="grid grid-cols-5 gap-2">
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
            </div>
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

        {/* Styling Options */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <h3 className="font-semibold text-sm">Styling</h3>

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
      </div>
    </>
  );
}
