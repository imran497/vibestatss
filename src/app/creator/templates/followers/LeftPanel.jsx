import { Layers, Type, Palette, Music, Image as ImageIcon, Upload, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import ColorControl from '@/app/components/common/ColorControl';
import { IMAGE_CATEGORIES, CATEGORY_LABELS, getImagesByCategory } from './image-registry';
import { useRef, useState } from 'react';
import TemplateSelectorModal from '@/app/creator/common/TemplateSelectorModal';

export default function LeftPanel({ config, setConfig, templateId, templateName }) {
  const fileInputRef = useRef(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const handleChange = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      setConfig(prev => ({
        ...prev,
        image: {
          category: IMAGE_CATEGORIES.CUSTOM,
          selectedId: null,
          customImageUrl: e.target.result
        }
      }));
    };
    reader.readAsDataURL(file);
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

      {/* Content Configuration */}
      <div className="space-y-3">
        <Label className="font-medium flex items-center gap-2">
          <Type size={16} className="text-primary" /> Content
        </Label>

        {/* Dynamic config component based on template type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Start Count</Label>
            <input
              type="number"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={config.self.start}
              onChange={(e) => handleChange('self', 'start', parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">End Count</Label>
            <input
              type="number"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={config.self.end}
              onChange={(e) => handleChange('self', 'end', parseInt(e.target.value))}
            />
          </div>

          <div className="col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Label Text</Label>
              <div className="flex gap-1 bg-muted p-0.5 rounded">
                <button
                  onClick={() => handleChange('self', 'labelPosition', 'above')}
                  className={`px-2 py-0.5 text-xs rounded transition-all ${
                    config.self.labelPosition === 'above'
                      ? 'bg-background shadow-sm'
                      : 'hover:bg-background/50'
                  }`}
                  title="Label above counter"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleChange('self', 'labelPosition', 'below')}
                  className={`px-2 py-0.5 text-xs rounded transition-all ${
                    config.self.labelPosition === 'below'
                      ? 'bg-background shadow-sm'
                      : 'hover:bg-background/50'
                  }`}
                  title="Label below counter"
                >
                  ↓
                </button>
              </div>
            </div>
            <input
              type="text"
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={config.self.label}
              onChange={(e) => handleChange('self', 'label', e.target.value)}
              placeholder="e.g. Followers"
            />
          </div>
        </div>
      </div>

      {/* Style Configuration */}
      <div className="space-y-3">
        <Label className="font-medium flex items-center gap-2">
          <Palette size={16} className="text-primary" /> Appearance
        </Label>

        {/* Font Selection */}
        <div className="space-y-2">
          <Label className="text-xs">Font Family</Label>
          <div className="grid grid-cols-2 gap-2">
            {['Outfit', 'Inter', 'Playfair', 'Space Mono'].map((font) => (
              <Button
                key={font}
                variant={config.style.font === font ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange('style', 'font', font)}
              >
                {font}
              </Button>
            ))}
          </div>
        </div>

        {/* Background Control */}
        <ColorControl
          label="Background"
          value={config.style.background}
          onChange={(val) => handleChange('style', 'background', val)}
        />

        {/* Text Control */}
        <ColorControl
          label="Text Color"
          value={config.style.text}
          onChange={(val) => handleChange('style', 'text', val)}
        />
      </div>

      {/* Image Selection */}
      <div className="space-y-3">
        <Label className="font-medium flex items-center gap-2">
          <ImageIcon size={16} className="text-primary" /> Image
        </Label>

        {/* Category Dropdown */}
        <div className="space-y-2">
          <Label className="text-xs">Category</Label>
          <Select
            value={config.image.category}
            onValueChange={(value) => setConfig(prev => ({
              ...prev,
              image: {
                category: value,
                selectedId: value === IMAGE_CATEGORIES.NONE ? null : prev.image.selectedId,
                customImageUrl: value === IMAGE_CATEGORIES.CUSTOM ? prev.image.customImageUrl : null
              }
            }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={IMAGE_CATEGORIES.NONE}>
                {CATEGORY_LABELS[IMAGE_CATEGORIES.NONE]}
              </SelectItem>
              <SelectItem value={IMAGE_CATEGORIES.TWITTER}>
                {CATEGORY_LABELS[IMAGE_CATEGORIES.TWITTER]}
              </SelectItem>
              <SelectItem value={IMAGE_CATEGORIES.CUSTOM}>
                {CATEGORY_LABELS[IMAGE_CATEGORIES.CUSTOM]}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Image Picker (shown when category has images) */}
        {config.image.category !== IMAGE_CATEGORIES.NONE &&
         config.image.category !== IMAGE_CATEGORIES.CUSTOM && (
          <div className="space-y-2">
            <Label className="text-xs">Select Image</Label>
            <div className="flex gap-2">
              {getImagesByCategory(config.image.category).map((image) => (
                <button
                  key={image.id}
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    image: { ...prev.image, selectedId: image.id, customImageUrl: null }
                  }))}
                  className={`relative w-12 h-12 rounded border-2 transition-all overflow-hidden flex-shrink-0 ${
                    config.image.selectedId === image.id
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                  }`}
                  title={image.name}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center p-1"
                    style={{ backgroundColor: image.preview.backgroundColor }}
                  >
                    <img
                      src={image.imagePath}
                      alt={image.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Custom Image Upload */}
        {config.image.category === IMAGE_CATEGORIES.CUSTOM && (
          <div className="space-y-2">
            <Label className="text-xs">Upload Image</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} className="mr-2" />
              {config.image.customImageUrl ? 'Change Image' : 'Upload Image'}
            </Button>
            {config.image.customImageUrl && (
              <div className="relative aspect-square rounded-lg border-2 border-primary overflow-hidden">
                <img
                  src={config.image.customImageUrl}
                  alt="Custom upload"
                  className="w-full h-full object-contain bg-white"
                />
              </div>
            )}
          </div>
        )}

        {/* Position Selector (shown when image is selected) */}
        {config.image.category !== IMAGE_CATEGORIES.NONE &&
         (config.image.selectedId || config.image.customImageUrl) && (
          <div className="space-y-2">
            <Label className="text-xs">Position</Label>
            <div className="flex justify-between bg-muted p-1.5 rounded-lg">
              {[
                { value: 'top-left', label: '↖' },
                { value: 'top-center', label: '↑' },
                { value: 'top-right', label: '↗' },
                { value: 'bottom-left', label: '↙' },
                { value: 'bottom-center', label: '↓' },
                { value: 'bottom-right', label: '↘' },
              ].map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setConfig(prev => ({
                    ...prev,
                    image: { ...prev.image, position: pos.value }
                  }))}
                  className={`w-8 h-8 rounded border transition-all flex items-center justify-center text-sm ${
                    config.image.position === pos.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-transparent hover:border-primary/50 hover:bg-background'
                  }`}
                  title={pos.value.replace('-', ' ')}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Music Selection */}
      <div className="space-y-2">
        <Label className="font-medium flex items-center gap-2">
          <Music size={16} className="text-accent" /> Background Music
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'none', label: 'No Music', emoji: '🔇' },
            { id: 'music2', label: 'Music', emoji: '🎹' },
          ].map((option) => (
            <Button
              key={option.id}
              variant={config.music === option.id ? 'secondary' : 'outline'}
              className="flex flex-col h-auto py-3 gap-1"
              onClick={() => setConfig(prev => ({ ...prev, music: option.id }))}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-xs">{option.label}</span>
            </Button>
          ))}
        </div>
      </div>

    </div>
    </>
  );
}
