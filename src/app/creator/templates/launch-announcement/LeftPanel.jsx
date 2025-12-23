'use client';

import { useEffect, useState } from 'react';
import { Upload, Sparkles, Palette, Layers, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import TemplateSelectorModal from '@/app/creator/common/TemplateSelectorModal';
import ColorPicker from '@/app/components/common/ColorPicker';

// Font options with CSS variables
const FONT_FAMILY_OPTIONS = [
  { value: 'var(--font-inter), sans-serif', label: 'Inter' },
  { value: 'var(--font-outfit), sans-serif', label: 'Outfit' },
  { value: 'var(--font-poppins), sans-serif', label: 'Poppins' },
  { value: 'var(--font-montserrat), sans-serif', label: 'Montserrat' },
  { value: 'var(--font-dm-sans), sans-serif', label: 'DM Sans' },
  { value: 'var(--font-work-sans), sans-serif', label: 'Work Sans' },
  { value: 'var(--font-plus-jakarta), sans-serif', label: 'Plus Jakarta Sans' },
  { value: 'var(--font-playfair), serif', label: 'Playfair Display' },
  { value: 'var(--font-merriweather), serif', label: 'Merriweather' },
  { value: 'var(--font-lora), serif', label: 'Lora' },
  { value: 'var(--font-bebas-neue), sans-serif', label: 'Bebas Neue' },
  { value: 'var(--font-oswald), sans-serif', label: 'Oswald' },
  { value: 'var(--font-righteous), sans-serif', label: 'Righteous' },
  { value: 'var(--font-jetbrains-mono), monospace', label: 'JetBrains Mono' },
  { value: 'var(--font-space-mono), monospace', label: 'Space Mono' },
];

const FONT_WEIGHTS = {
  'var(--font-inter), sans-serif': ['300', '400', '500', '600', '700', '800', '900'],
  'var(--font-outfit), sans-serif': ['300', '400', '500', '600', '700', '800', '900'],
  'var(--font-poppins), sans-serif': ['300', '400', '500', '600', '700', '800', '900'],
  'var(--font-montserrat), sans-serif': ['300', '400', '500', '600', '700', '800', '900'],
  'var(--font-dm-sans), sans-serif': ['400', '500', '700'],
  'var(--font-work-sans), sans-serif': ['300', '400', '500', '600', '700', '800', '900'],
  'var(--font-plus-jakarta), sans-serif': ['300', '400', '500', '600', '700', '800'],
  'var(--font-playfair), serif': ['400', '500', '600', '700', '800', '900'],
  'var(--font-merriweather), serif': ['300', '400', '700', '900'],
  'var(--font-lora), serif': ['400', '500', '600', '700'],
  'var(--font-bebas-neue), sans-serif': ['400'],
  'var(--font-oswald), sans-serif': ['300', '400', '500', '600', '700'],
  'var(--font-righteous), sans-serif': ['400'],
  'var(--font-jetbrains-mono), monospace': ['300', '400', '500', '600', '700', '800'],
  'var(--font-space-mono), monospace': ['400', '700'],
};

export default function LeftPanel({ config, setConfig, templateId, templateName }) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Extract domain from URL
  const getDomainFromUrl = (url) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch {
      return null;
    }
  };

  // Get favicon URL from domain
  const getFaviconUrl = (url) => {
    const domain = getDomainFromUrl(url);
    if (!domain) return null;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  };

  // Auto-fetch favicon when link changes
  useEffect(() => {
    if (config.product.link && !config.product.customLogo) {
      const faviconUrl = getFaviconUrl(config.product.link);
      if (faviconUrl) {
        setConfig(prev => ({
          ...prev,
          product: { ...prev.product, logo: faviconUrl }
        }));
      }
    }
  }, [config.product.link]);

  useEffect(() => {
    if (config.platform.link && !config.platform.customLogo) {
      const faviconUrl = getFaviconUrl(config.platform.link);
      if (faviconUrl) {
        setConfig(prev => ({
          ...prev,
          platform: { ...prev.platform, logo: faviconUrl }
        }));
      }
    }
  }, [config.platform.link]);

  // Handle logo upload
  const handleLogoUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setConfig(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          logo: event.target.result,
          customLogo: true // Mark as custom uploaded
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Template Selector Modal */}
      <TemplateSelectorModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        currentTemplate={templateId}
      />

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

      {/* Template Header */}
      <div className="pb-4 border-b border-border">
        <h1 className="text-2xl font-bold mb-1">{templateName}</h1>
        <p className="text-sm text-muted-foreground">Create stunning product launch videos</p>
      </div>

      {/* Product Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Product Details
        </div>

        {/* Product Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Name</label>
          <input
            type="text"
            value={config.product.name}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              product: { ...prev.product, name: e.target.value }
            }))}
            placeholder="e.g., VibeStatss"
            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {/* Product Link */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Link</label>
          <input
            type="url"
            value={config.product.link}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              product: { ...prev.product, link: e.target.value }
            }))}
            placeholder="https://yourproduct.com"
            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {/* Product Logo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Product Logo</label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(e, 'product')}
              className="hidden"
              id="product-logo-upload"
            />
            <label
              htmlFor="product-logo-upload"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-background border border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              {config.product.logo ? 'Change Logo' : 'Upload Logo'}
            </label>
            {config.product.logo && (
              <div className="mt-2 p-2 bg-muted rounded-lg flex items-center justify-center h-20 relative">
                <Image
                  src={config.product.logo}
                  alt="Product logo"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {config.product.customLogo ? 'Custom logo uploaded' : 'Auto-fetched from link'}
            </p>
          </div>
        </div>
      </div>

      {/* Platform Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Platform Details
        </div>

        {/* Platform Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Platform Name</label>
          <input
            type="text"
            value={config.platform.name}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              platform: { ...prev.platform, name: e.target.value }
            }))}
            placeholder="e.g., Product Hunt"
            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {/* Platform Link */}
        <div>
          <label className="block text-sm font-medium mb-2">Platform Link</label>
          <input
            type="url"
            value={config.platform.link}
            onChange={(e) => setConfig(prev => ({
              ...prev,
              platform: { ...prev.platform, link: e.target.value }
            }))}
            placeholder="https://platform.com"
            className="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
          />
        </div>

        {/* Platform Logo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Platform Logo</label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(e, 'platform')}
              className="hidden"
              id="platform-logo-upload"
            />
            <label
              htmlFor="platform-logo-upload"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-background border border-input rounded-lg cursor-pointer hover:bg-muted/50 transition-colors text-sm"
            >
              <Upload className="h-4 w-4" />
              {config.platform.logo ? 'Change Logo' : 'Upload Logo'}
            </label>
            {config.platform.logo && (
              <div className="mt-2 p-2 bg-muted rounded-lg flex items-center justify-center h-20 relative">
                <Image
                  src={config.platform.logo}
                  alt="Platform logo"
                  fill
                  className="object-contain p-2"
                  unoptimized
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {config.platform.customLogo ? 'Custom logo uploaded' : 'Auto-fetched from link'}
            </p>
          </div>
        </div>
      </div>

      {/* Type */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Type
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'launching', label: 'Launching' },
            { value: 'featuring', label: 'Featuring' }
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setConfig(prev => ({ ...prev, type: type.value }))}
              className={`p-3 rounded-lg border transition-all text-center ${config.type === type.value
                  ? 'border-primary bg-primary/10'
                  : 'border-input hover:border-muted-foreground'
                }`}
            >
              <div className="font-medium text-sm">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Background */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          Background
        </div>

        {/* Background Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setConfig(prev => ({ ...prev, backgroundType: 'image' }))}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              config.backgroundType === 'image'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Image
          </button>
          <button
            onClick={() => setConfig(prev => ({ ...prev, backgroundType: 'gradient' }))}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              config.backgroundType === 'gradient'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            Gradient
          </button>
        </div>

        {/* Image Selector */}
        {config.backgroundType === 'image' && (
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <button
                key={num}
                onClick={() => setConfig(prev => ({ ...prev, backgroundImage: num }))}
                className={`aspect-square rounded-lg border-2 overflow-hidden transition-all relative ${
                  config.backgroundImage === num
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-input hover:border-muted-foreground'
                }`}
              >
                <Image
                  src={`/abstract/${num}.jpg`}
                  alt={`Background ${num}`}
                  fill
                  className="object-cover"
                  quality={75}
                  sizes="(max-width: 400px) 20vw, 80px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Gradient Color Controls */}
        {config.backgroundType === 'gradient' && (
          <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr auto' }}>
            {/* Color 1 Picker */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground">Color 1</label>
              <ColorPicker
                color={config.backgroundGradient.color1}
                onChange={(color) => setConfig(prev => ({
                  ...prev,
                  backgroundGradient: { ...prev.backgroundGradient, color1: color }
                }))}
              />
            </div>

            {/* Color 2 Picker */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground">Color 2</label>
              <ColorPicker
                color={config.backgroundGradient.color2}
                onChange={(color) => setConfig(prev => ({
                  ...prev,
                  backgroundGradient: { ...prev.backgroundGradient, color2: color }
                }))}
              />
            </div>

            {/* Random Button */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase text-muted-foreground">Random</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const randomColor1 = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
                  const randomColor2 = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
                  setConfig(prev => ({
                    ...prev,
                    backgroundGradient: { color1: randomColor1, color2: randomColor2, direction: 'to bottom right' }
                  }));
                }}
                className="w-9 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 border-border"
                title="Generate random colors"
              >
                <Sparkles className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Colors */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Palette className="h-4 w-4" />
          Colors
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-muted-foreground">Text</label>
            <ColorPicker
              color={config.colors.text}
              onChange={(color) => setConfig(prev => ({
                ...prev,
                colors: { ...prev.colors, text: color }
              }))}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-muted-foreground">Secondary</label>
            <ColorPicker
              color={config.colors.secondary}
              onChange={(color) => setConfig(prev => ({
                ...prev,
                colors: { ...prev.colors, secondary: color }
              }))}
            />
          </div>
        </div>
      </div>

      {/* Font */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="font">Font</Label>
          <Select
            value={config.font}
            onValueChange={(value) => {
              const weights = FONT_WEIGHTS[value] || ['400'];
              const newWeight = weights.includes(config.fontWeight) ? config.fontWeight : weights[weights.length - 1];
              setConfig(prev => ({ ...prev, font: value, fontWeight: newWeight }));
            }}
          >
            <SelectTrigger id="font">
              <SelectValue>
                <span style={{ fontFamily: config.font }}>
                  {FONT_FAMILY_OPTIONS.find(f => f.value === config.font)?.label || 'Outfit'}
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
          <Label htmlFor="fontWeight">Weight</Label>
          <Select
            value={config.fontWeight}
            onValueChange={(value) => setConfig(prev => ({ ...prev, fontWeight: value }))}
          >
            <SelectTrigger id="fontWeight">
              <SelectValue>{config.fontWeight}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(FONT_WEIGHTS[config.font] || ['400']).map(weight => (
                <SelectItem key={weight} value={weight}>
                  {weight === '400' ? 'Regular (400)' : weight === '700' ? 'Bold (700)' : weight}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

    </div>
  );
}
