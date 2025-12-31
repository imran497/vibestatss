'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';
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
import TemplateCarousel from '@/app/creator/common/TemplateCarousel';
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

      </div>
    </>
  );
}
