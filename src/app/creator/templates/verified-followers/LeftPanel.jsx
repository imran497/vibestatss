'use client';

import { useState } from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import TemplateSelectorModal from '@/app/creator/common/TemplateSelectorModal';
import { formatCount } from './confettiConfig';

export default function LeftPanel({ config, setConfig, templateId, templateName }) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const updateConfig = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const updateExportConfig = (field, value) => {
    setConfig(prev => ({
      ...prev,
      export: { ...prev.export, [field]: value }
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
            Showcase your X (Twitter) verified follower statistics
          </p>
        </div>

      {/* Numbers Section */}
      <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
        <h3 className="font-semibold text-sm">Follower Statistics</h3>

        <div className="space-y-2">
          <Label htmlFor="verifiedCount">Verified Followers</Label>
          <Input
            id="verifiedCount"
            type="number"
            value={config.verifiedCount}
            onChange={(e) => updateConfig('verifiedCount', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalCount">Total Followers</Label>
          <Input
            id="totalCount"
            type="number"
            value={config.totalCount}
            onChange={(e) => updateConfig('totalCount', parseInt(e.target.value) || 0)}
            min="0"
          />
        </div>
      </div>

      {/* Animation Settings */}
      <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
        <h3 className="font-semibold text-sm">Animation Settings</h3>

        <div className="space-y-2">
          <Label htmlFor="animationStyle">Animation Style</Label>
          <Select
            value={config.animationStyle}
            onValueChange={(value) => updateConfig('animationStyle', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select animation style" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="style-1">Style 1 - Character Reveal</SelectItem>
              <SelectItem value="style-2">Style 2 - Bouncer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="showConfetti"
            checked={config.showConfetti}
            onChange={(e) => updateConfig('showConfetti', e.target.checked)}
            className="w-4 h-4 rounded border-input"
          />
          <Label htmlFor="showConfetti" className="cursor-pointer">Show Confetti</Label>
        </div>
      </div>

      {/* Export Settings */}
      <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
        <h3 className="font-semibold text-sm">Export Settings</h3>

        <div className="space-y-2">
          <Label htmlFor="aspectRatio">Aspect Ratio</Label>
          <Select
            value={`${config.export.width}x${config.export.height}`}
            onValueChange={(value) => {
              const [width, height] = value.split('x').map(Number);
              updateExportConfig('width', width);
              updateExportConfig('height', height);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select aspect ratio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1080x1920">9:16 - Vertical (Stories, Reels, TikTok)</SelectItem>
              <SelectItem value="1080x1080">1:1 - Square (Instagram)</SelectItem>
              <SelectItem value="1920x1080">16:9 - Horizontal (YouTube, Twitter)</SelectItem>
              <SelectItem value="1080x1350">4:5 - Portrait (Instagram Feed)</SelectItem>
              <SelectItem value="1080x1440">3:4 - Portrait</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      </div>
    </>
  );
}
