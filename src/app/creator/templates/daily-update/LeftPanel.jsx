'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronRight, Plus, Trash2, ChevronDown, Sparkles, ArrowUp, ArrowDown, ZoomIn, Zap, X, Eye, Upload } from 'lucide-react';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import TemplateSelectorModal from '@/app/creator/common/TemplateSelectorModal';
import ColorPicker from '@/app/components/common/ColorPicker';
import EmojiPicker from 'emoji-picker-react';

const ANIMATION_OPTIONS = [
  { value: 'fade', label: 'Fade In', Icon: Sparkles },
  { value: 'slideUp', label: 'Slide Up', Icon: ArrowUp },
  { value: 'slideDown', label: 'Slide Down', Icon: ArrowDown },
  { value: 'zoom', label: 'Zoom In', Icon: ZoomIn },
  { value: 'bounce', label: 'Bounce', Icon: Zap },
  { value: 'reveal', label: 'Reveal', Icon: Eye },
];

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

const FONT_WEIGHT_OPTIONS = [
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
];

// Map of font families to their available weights
const FONT_WEIGHTS_BY_FAMILY = {
  'system-ui, -apple-system, sans-serif': [300, 400, 500, 600, 700, 800, 900],
  'Arial, sans-serif': [400, 700],
  'Helvetica, sans-serif': [300, 400, 700, 900],
  'Georgia, serif': [400, 700],
  'Times New Roman, serif': [400, 700],
  'Courier New, monospace': [400, 700],
  'Verdana, sans-serif': [400, 700],
  'Impact, sans-serif': [400],
  'Trebuchet MS, sans-serif': [400, 700],
};

// Get available weights for a font family
const getAvailableWeights = (fontFamily) => {
  const availableWeights = FONT_WEIGHTS_BY_FAMILY[fontFamily] || [400, 700];
  return FONT_WEIGHT_OPTIONS.filter(weight => availableWeights.includes(weight.value));
};

// Get closest available weight for a font family
const getClosestWeight = (fontFamily, currentWeight) => {
  const availableWeights = FONT_WEIGHTS_BY_FAMILY[fontFamily] || [400, 700];
  if (availableWeights.includes(currentWeight)) return currentWeight;

  // Find closest weight
  const closest = availableWeights.reduce((prev, curr) =>
    Math.abs(curr - currentWeight) < Math.abs(prev - currentWeight) ? curr : prev
  );
  return closest;
};

// Gradient presets for backgrounds
const GRADIENT_PRESETS = [
  { name: 'Sunset', colors: ['#FF6B6B', '#FFE66D'] },
  { name: 'Ocean', colors: ['#4FACFE', '#00F2FE'] },
  { name: 'Purple Dream', colors: ['#A8EDEA', '#FED6E3'] },
  { name: 'Fire', colors: ['#FF0844', '#FFB199'] },
  { name: 'Forest', colors: ['#134E5E', '#71B280'] },
  { name: 'Random', colors: null }, // Random gradient generator
];

// Gradient presets for text (more vibrant)
const TEXT_GRADIENT_PRESETS = [
  { name: 'Rainbow', colors: ['#FF0080', '#7928CA'] },
  { name: 'Gold Shine', colors: ['#FFD700', '#FFA500'] },
  { name: 'Blue Ice', colors: ['#00D4FF', '#0099FF'] },
  { name: 'Pink Pop', colors: ['#FF1493', '#FF69B4'] },
  { name: 'Purple Magic', colors: ['#A855F7', '#EC4899'] },
  { name: 'Random', colors: null }, // Random gradient generator
];

// Generate random gradient colors
const generateRandomGradient = () => {
  const randomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 70 + Math.floor(Math.random() * 30); // 70-100%
    const lightness = 50 + Math.floor(Math.random() * 20); // 50-70%
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  // Convert HSL to hex
  const hslToHex = (h, s, l) => {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };

  const hue1 = Math.floor(Math.random() * 360);
  const hue2 = (hue1 + 60 + Math.floor(Math.random() * 120)) % 360; // 60-180 degrees apart
  const saturation = 70 + Math.floor(Math.random() * 30);
  const lightness = 50 + Math.floor(Math.random() * 20);

  return [
    hslToHex(hue1, saturation, lightness),
    hslToHex(hue2, saturation, lightness)
  ];
};

// Animation variants for preview
const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        bounce: 0.5,
        duration: 0.8,
      },
    },
    exit: { opacity: 0, scale: 0.3 },
  },
  reveal: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
      },
    },
    exit: { opacity: 0 },
  },
};

const wordVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function LeftPanel({ config, setConfig, templateId, templateName }) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [customIcon, setCustomIcon] = useState(null);

  // Replay animation when animation type or text changes
  useEffect(() => {
    if (editingSlide) {
      setPreviewKey(prev => prev + 1);
    }
  }, [editingSlide?.animation, editingSlide?.text]);

  // Scroll to top when edit modal opens
  useEffect(() => {
    if (editingSlide) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const scrollContainers = document.querySelectorAll('.overflow-y-auto');
        // Target the modal's scrollable container (usually the last one rendered)
        if (scrollContainers.length > 0) {
          const modalScroll = scrollContainers[scrollContainers.length - 1];
          modalScroll.scrollTop = 0;
        }
      }, 10);
    }
  }, [editingSlide?.id]);

  const updateConfig = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Update global background and propagate to slides without custom backgrounds
  const updateGlobalBackground = (field, value) => {
    setConfig(prev => {
      const updates = { [field]: value };

      // Update slides that don't have custom backgrounds
      if (field === 'bgColors' || field === 'bgIsGradient') {
        updates.textSlides = prev.textSlides.map(slide => {
          if (slide.hasCustomBg) return slide; // Keep custom backgrounds

          // Update slides following global background
          if (field === 'bgColors') {
            return { ...slide, bgColors: [...value] };
          } else if (field === 'bgIsGradient') {
            return { ...slide, bgIsGradient: value };
          }
          return slide;
        });
      }

      return { ...prev, ...updates };
    });
  };

  const addTextSlide = (copyFromPrevious = false) => {
    let newSlide;

    if (copyFromPrevious && config.textSlides.length > 0) {
      // Copy style from last slide
      const lastSlide = config.textSlides[config.textSlides.length - 1];
      newSlide = {
        ...lastSlide,
        id: Date.now(),
        text: 'New Slide', // Reset text
      };
    } else {
      // Create new slide with defaults
      newSlide = {
        id: Date.now(),
        text: 'New Slide',
        animation: 'fade',
        textColors: ['#FFFFFF', '#FFFFFF'],
        isGradient: false,
        duration: 2,
        fontSize: 35,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 700,
        bgColors: [...config.bgColors], // Copy current global background
        bgIsGradient: config.bgIsGradient,
        hasCustomBg: false, // Track if background has been customized
        emoji: '', // Emoji character
        emojiSize: 60, // Emoji size (30-120)
        emojiPosition: 'top', // 'top' or 'bottom'
      };
    }

    setConfig(prev => ({
      ...prev,
      textSlides: [...prev.textSlides, newSlide],
    }));
  };

  const updateSlide = (slideId, field, value) => {
    setConfig(prev => ({
      ...prev,
      textSlides: prev.textSlides.map(slide =>
        slide.id === slideId ? { ...slide, [field]: value } : slide
      ),
    }));
  };

  const deleteSlide = (slideId) => {
    setConfig(prev => ({
      ...prev,
      textSlides: prev.textSlides.filter(slide => slide.id !== slideId),
    }));
  };

  const handleIconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Validate dimensions (must be square, between 50-512px)
        if (img.width !== img.height) {
          alert('Icon must be square (equal width and height).\nExample: 100×100px, 256×256px, 512×512px');
          return;
        }

        if (img.width < 50 || img.width > 512) {
          alert('Icon dimensions must be between 50×50px and 512×512px');
          return;
        }

        // Store the base64 image
        const iconData = event.target.result;
        updateSlide(editingSlide.id, 'emoji', iconData);
        updateSlide(editingSlide.id, 'isCustomIcon', true);
        setEditingSlide({ ...editingSlide, emoji: iconData, isCustomIcon: true });
        setCustomIcon(iconData);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
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
            Create animated text videos with custom styling and effects
          </p>
        </div>

        {/* Text Slides */}
        <div className="space-y-4 p-4 rounded-lg border border-border bg-card/50">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Text Slides</h3>
            <button
              onClick={() => addTextSlide(false)}
              className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} />
              Add Slide
            </button>
          </div>

          <div className="space-y-3">
            {config.textSlides.map((slide, index) => {
              const currentAnimation = ANIMATION_OPTIONS.find(opt => opt.value === slide.animation) || ANIMATION_OPTIONS[0];
              const AnimIcon = currentAnimation.Icon;

              return (
                <div
                  key={slide.id}
                  className="p-3 rounded-lg border border-border bg-background hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Slide {index + 1}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{slide.duration}s</span>
                        <AnimIcon size={14} className="text-muted-foreground" />
                      </div>
                      <p className="text-sm line-clamp-2 text-foreground/80">
                        {slide.text || 'Empty slide'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingSlide(slide)}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                        title="Edit slide"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteSlide(slide.id)}
                        className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
                        title="Delete slide"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edit Slide Modal */}
      {editingSlide && (() => {
        const currentAnimation = ANIMATION_OPTIONS.find(opt => opt.value === editingSlide.animation) || ANIMATION_OPTIONS[0];
        const AnimIcon = currentAnimation.Icon;

        const textStyle = editingSlide.isGradient
          ? {
              backgroundImage: `linear-gradient(135deg, ${editingSlide.textColors[0]} 0%, ${editingSlide.textColors[1]} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }
          : {
              color: editingSlide.textColors[0],
            };

        // Use slide background colors (initialized with global by default)
        const activeBgColors = editingSlide.bgColors || config.bgColors;
        const activeBgIsGradient = editingSlide.bgIsGradient !== undefined ? editingSlide.bgIsGradient : config.bgIsGradient;

        const bgStyle = activeBgIsGradient
          ? {
              background: `linear-gradient(135deg, ${activeBgColors[0]} 0%, ${activeBgColors[1]} 100%)`,
            }
          : {
              backgroundColor: activeBgColors[0],
            };

        return (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setEditingSlide(null)}
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-lg shadow-2xl border border-border w-full max-w-6xl h-[90vh] flex overflow-hidden">
                {/* Left: Edit Controls - Scrollable */}
                <div className="w-[360px] flex flex-col overflow-hidden flex-shrink-0">
                  <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-semibold">Edit Slide</h3>
                    <button
                      onClick={() => setEditingSlide(null)}
                      className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-4">
                {/* Copy Style From Another Slide */}
                {config.textSlides.length > 1 && (
                  <div className="space-y-2">
                    <Label>Copy Style From</Label>
                    <Select
                      value=""
                      onValueChange={(slideId) => {
                        const sourceSlide = config.textSlides.find(s => s.id === parseInt(slideId));
                        if (sourceSlide) {
                          const styleCopy = {
                            animation: sourceSlide.animation,
                            textColors: [...sourceSlide.textColors],
                            isGradient: sourceSlide.isGradient,
                            fontSize: sourceSlide.fontSize,
                            fontFamily: sourceSlide.fontFamily,
                            fontWeight: sourceSlide.fontWeight,
                            bgColors: sourceSlide.bgColors ? [...sourceSlide.bgColors] : [...config.bgColors],
                            bgIsGradient: sourceSlide.bgIsGradient !== undefined ? sourceSlide.bgIsGradient : config.bgIsGradient,
                            hasCustomBg: sourceSlide.hasCustomBg,
                            emoji: sourceSlide.emoji,
                            emojiSize: sourceSlide.emojiSize,
                            emojiPosition: sourceSlide.emojiPosition,
                            duration: sourceSlide.duration,
                          };

                          Object.entries(styleCopy).forEach(([key, value]) => {
                            updateSlide(editingSlide.id, key, value);
                          });

                          setEditingSlide({ ...editingSlide, ...styleCopy });
                          setPreviewKey(prev => prev + 1);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a slide to copy style from..." />
                      </SelectTrigger>
                      <SelectContent>
                        {config.textSlides
                          .filter(s => s.id !== editingSlide.id)
                          .map((slide) => {
                            const slideNumber = config.textSlides.findIndex(s => s.id === slide.id) + 1;
                            return (
                              <SelectItem key={slide.id} value={String(slide.id)}>
                                Slide {slideNumber}: {slide.text ? (slide.text.substring(0, 30) + (slide.text.length > 30 ? '...' : '')) : 'Empty'}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Text */}
                <div className="space-y-2">
                  <Label htmlFor="edit-text">Text</Label>
                  <textarea
                    id="edit-text"
                    value={editingSlide.text}
                    onChange={(e) => {
                      updateSlide(editingSlide.id, 'text', e.target.value);
                      setEditingSlide({ ...editingSlide, text: e.target.value });
                    }}
                    placeholder="Enter text..."
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                    {/* Animation */}
                    <div className="space-y-2">
                      <Label>Animation</Label>
                      <Select
                        value={editingSlide.animation}
                        onValueChange={(value) => {
                          updateSlide(editingSlide.id, 'animation', value);
                          setEditingSlide({ ...editingSlide, animation: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>
                            <span className="flex items-center gap-2">
                              <AnimIcon size={16} />
                              <span>{currentAnimation.label}</span>
                            </span>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {ANIMATION_OPTIONS.map(opt => {
                            const OptionIcon = opt.Icon;
                            return (
                              <SelectItem key={opt.value} value={opt.value}>
                                <span className="flex items-center gap-2">
                                  <OptionIcon size={16} />
                                  <span>{opt.label}</span>
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                {/* Text Colors */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Text</Label>

                  <div className="flex items-center justify-between mt-3">
                    <Label htmlFor="edit-gradient" className="text-sm">Use Gradient</Label>
                    <Switch
                      id="edit-gradient"
                      checked={editingSlide.isGradient}
                      onCheckedChange={(checked) => {
                        updateSlide(editingSlide.id, 'isGradient', checked);
                        setEditingSlide({ ...editingSlide, isGradient: checked });
                      }}
                    />
                  </div>

                  {editingSlide.isGradient && (
                    <div className="space-y-2 mt-2">
                      <Label className="text-xs text-muted-foreground">Gradient Presets</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {TEXT_GRADIENT_PRESETS.map(preset => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              const colors = preset.colors || generateRandomGradient();
                              updateSlide(editingSlide.id, 'textColors', colors);
                              setEditingSlide({ ...editingSlide, textColors: colors });
                            }}
                            className="h-8 rounded-md border border-border hover:border-primary transition-colors relative overflow-hidden"
                            style={
                              preset.colors
                                ? {
                                    background: `linear-gradient(135deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 100%)`
                                  }
                                : {
                                    background: 'linear-gradient(135deg, #FF0080 0%, #FF8C00 20%, #40E0D0 40%, #4169E1 60%, #9370DB 80%, #FF1493 100%)'
                                  }
                            }
                            title={preset.name}
                          >
                            {!preset.colors && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                                ?
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        {editingSlide.isGradient ? 'Color 1' : 'Text Color'}
                      </Label>
                      <ColorPicker
                        color={editingSlide.textColors[0]}
                        onChange={(color) => {
                          const newColors = [...editingSlide.textColors];
                          newColors[0] = color;
                          updateSlide(editingSlide.id, 'textColors', newColors);
                          setEditingSlide({ ...editingSlide, textColors: newColors });
                        }}
                      />
                    </div>
                    {editingSlide.isGradient && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Color 2</Label>
                        <ColorPicker
                          color={editingSlide.textColors[1]}
                          onChange={(color) => {
                            const newColors = [...editingSlide.textColors];
                            newColors[1] = color;
                            updateSlide(editingSlide.id, 'textColors', newColors);
                            setEditingSlide({ ...editingSlide, textColors: newColors });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-border my-4"></div>

                {/* Background Colors */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Background</Label>

                  <div className="flex items-center justify-between mt-3">
                    <Label htmlFor="edit-bgGradient" className="text-sm">Use Gradient</Label>
                    <Switch
                      id="edit-bgGradient"
                      checked={editingSlide.bgIsGradient || false}
                      onCheckedChange={(checked) => {
                        updateSlide(editingSlide.id, 'bgIsGradient', checked);
                        updateSlide(editingSlide.id, 'hasCustomBg', true);
                        setEditingSlide({ ...editingSlide, bgIsGradient: checked, hasCustomBg: true });
                      }}
                    />
                  </div>

                  {editingSlide.bgIsGradient && (
                    <div className="space-y-2 mt-2">
                      <Label className="text-xs text-muted-foreground">Gradient Presets</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {GRADIENT_PRESETS.map(preset => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => {
                              const colors = preset.colors || generateRandomGradient();
                              updateSlide(editingSlide.id, 'bgColors', colors);
                              updateSlide(editingSlide.id, 'hasCustomBg', true);
                              setEditingSlide({ ...editingSlide, bgColors: colors, hasCustomBg: true });
                            }}
                            className="h-8 rounded-md border border-border hover:border-primary transition-colors relative overflow-hidden"
                            style={
                              preset.colors
                                ? {
                                    background: `linear-gradient(135deg, ${preset.colors[0]} 0%, ${preset.colors[1]} 100%)`
                                  }
                                : {
                                    background: 'linear-gradient(135deg, #FF0080 0%, #FF8C00 20%, #40E0D0 40%, #4169E1 60%, #9370DB 80%, #FF1493 100%)'
                                  }
                            }
                            title={preset.name}
                          >
                            {!preset.colors && (
                              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                                ?
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        {editingSlide.bgIsGradient ? 'Color 1' : 'Background Color'}
                      </Label>
                      <ColorPicker
                        color={(editingSlide.bgColors && editingSlide.bgColors[0]) || config.bgColors[0]}
                        onChange={(color) => {
                          const newColors = [...(editingSlide.bgColors || [...config.bgColors])];
                          newColors[0] = color;
                          updateSlide(editingSlide.id, 'bgColors', newColors);
                          updateSlide(editingSlide.id, 'hasCustomBg', true);
                          setEditingSlide({ ...editingSlide, bgColors: newColors, hasCustomBg: true });
                        }}
                      />
                    </div>
                    {editingSlide.bgIsGradient && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Color 2</Label>
                        <ColorPicker
                          color={(editingSlide.bgColors && editingSlide.bgColors[1]) || config.bgColors[1]}
                          onChange={(color) => {
                            const newColors = [...(editingSlide.bgColors || [...config.bgColors])];
                            newColors[1] = color;
                            updateSlide(editingSlide.id, 'bgColors', newColors);
                            updateSlide(editingSlide.id, 'hasCustomBg', true);
                            setEditingSlide({ ...editingSlide, bgColors: newColors, hasCustomBg: true });
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label htmlFor="edit-duration">Duration (seconds)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editingSlide.duration}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 2;
                      updateSlide(editingSlide.id, 'duration', value);
                      setEditingSlide({ ...editingSlide, duration: value });
                    }}
                    min="0.5"
                    step="0.5"
                  />
                </div>

                {/* Font Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-fontSize">Font Size</Label>
                    <span className="text-sm text-muted-foreground">{editingSlide.fontSize}px</span>
                  </div>
                  <input
                    id="edit-fontSize"
                    type="range"
                    value={editingSlide.fontSize}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      updateSlide(editingSlide.id, 'fontSize', value);
                      setEditingSlide({ ...editingSlide, fontSize: value });
                    }}
                    min="30"
                    max="80"
                    step="5"
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>30px</span>
                    <span>80px</span>
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={editingSlide.fontFamily || 'system-ui, -apple-system, sans-serif'}
                    onValueChange={(value) => {
                      const currentWeight = editingSlide.fontWeight || 700;
                      const adjustedWeight = getClosestWeight(value, currentWeight);

                      updateSlide(editingSlide.id, 'fontFamily', value);
                      if (adjustedWeight !== currentWeight) {
                        updateSlide(editingSlide.id, 'fontWeight', adjustedWeight);
                      }
                      setEditingSlide({
                        ...editingSlide,
                        fontFamily: value,
                        fontWeight: adjustedWeight
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        <span style={{ fontFamily: editingSlide.fontFamily || 'system-ui, -apple-system, sans-serif' }}>
                          {FONT_FAMILY_OPTIONS.find(f => f.value === (editingSlide.fontFamily || 'system-ui, -apple-system, sans-serif'))?.label}
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

                {/* Font Weight */}
                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select
                    value={String(editingSlide.fontWeight || 700)}
                    onValueChange={(value) => {
                      const numValue = parseInt(value);
                      updateSlide(editingSlide.id, 'fontWeight', numValue);
                      setEditingSlide({ ...editingSlide, fontWeight: numValue });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableWeights(editingSlide.fontFamily || 'system-ui, -apple-system, sans-serif').map(weight => (
                        <SelectItem key={weight.value} value={String(weight.value)}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                    </div>

                    {/* Emoji Section */}
                    <div className="px-6 py-4 space-y-4 border-t border-border">
                      <h4 className="text-sm font-medium">Emoji (Optional)</h4>

                      {/* Emoji Picker */}
                      <div className="space-y-2">
                        <Label>Select Emoji</Label>

                        {/* Current Selection Display */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 px-4 py-3 rounded-md border border-input bg-background text-center min-h-[56px] flex items-center justify-center">
                            {editingSlide.emoji ? (
                              editingSlide.isCustomIcon ? (
                                <img src={editingSlide.emoji} alt="Custom icon" className="max-h-[40px] max-w-[40px] object-contain" />
                              ) : (
                                <span className="text-3xl">{editingSlide.emoji}</span>
                              )
                            ) : (
                              <span className="text-sm text-muted-foreground">None</span>
                            )}
                          </div>
                          {editingSlide.emoji && (
                            <button
                              type="button"
                              onClick={() => {
                                updateSlide(editingSlide.id, 'emoji', '');
                                updateSlide(editingSlide.id, 'isCustomIcon', false);
                                setEditingSlide({ ...editingSlide, emoji: '', isCustomIcon: false });
                                setCustomIcon(null);
                              }}
                              className="px-4 py-3 rounded-md border border-border hover:border-destructive hover:bg-destructive/10 hover:text-destructive transition-colors"
                              title="Remove emoji/icon"
                            >
                              <X size={20} />
                            </button>
                          )}
                        </div>

                        {/* Upload Button */}
                        <label className="cursor-pointer block">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleIconUpload}
                            className="hidden"
                          />
                          <div className="w-full px-4 py-2 rounded-md border border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                            <Upload size={16} />
                            <span className="text-sm font-medium">Upload</span>
                          </div>
                        </label>

                        {/* Emoji Picker */}
                        <div>
                          <EmojiPicker
                            onEmojiClick={(emojiData) => {
                              updateSlide(editingSlide.id, 'emoji', emojiData.emoji);
                              updateSlide(editingSlide.id, 'isCustomIcon', false);
                              setEditingSlide({ ...editingSlide, emoji: emojiData.emoji, isCustomIcon: false });
                            }}
                            width="100%"
                            height="350px"
                            searchDisabled={false}
                            skinTonesDisabled
                            previewConfig={{ showPreview: false }}
                          />
                        </div>
                      </div>

                      {editingSlide.emoji && (
                        <>
                          {/* Emoji Size */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="edit-emojiSize">Emoji Size</Label>
                              <span className="text-sm text-muted-foreground">{editingSlide.emojiSize || 60}px</span>
                            </div>
                            <input
                              id="edit-emojiSize"
                              type="range"
                              value={editingSlide.emojiSize || 60}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                updateSlide(editingSlide.id, 'emojiSize', value);
                                setEditingSlide({ ...editingSlide, emojiSize: value });
                              }}
                              min="30"
                              max="120"
                              step="5"
                              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>30px</span>
                              <span>120px</span>
                            </div>
                          </div>

                          {/* Emoji Position */}
                          <div className="space-y-2">
                            <Label>Emoji Position</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  updateSlide(editingSlide.id, 'emojiPosition', 'top');
                                  setEditingSlide({ ...editingSlide, emojiPosition: 'top' });
                                }}
                                className={`px-4 py-2 rounded-md border transition-colors ${
                                  (editingSlide.emojiPosition || 'top') === 'top'
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:border-primary'
                                }`}
                              >
                                Top
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateSlide(editingSlide.id, 'emojiPosition', 'bottom');
                                  setEditingSlide({ ...editingSlide, emojiPosition: 'bottom' });
                                }}
                                className={`px-4 py-2 rounded-md border transition-colors ${
                                  editingSlide.emojiPosition === 'bottom'
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:border-primary'
                                }`}
                              >
                                Bottom
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="bg-card border-t border-border px-6 py-4 flex-shrink-0">
                    <button
                      onClick={() => setEditingSlide(null)}
                      className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>

                {/* Right: Preview */}
                <div className="flex-1 bg-muted/30 flex items-center justify-center p-2 border-l border-border">
                  <div className="flex items-center justify-center">
                    <div
                      className="rounded-lg flex items-center justify-center shadow-lg overflow-hidden"
                      style={{
                        ...bgStyle,
                        width: '680px',
                        height: '380px',
                      }}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={previewKey}
                          initial={animationVariants[editingSlide.animation]?.initial}
                          animate={animationVariants[editingSlide.animation]?.animate}
                          transition={{ duration: 0.5 }}
                          className="w-full h-full flex items-center justify-center px-4"
                        >
                          <div className="flex flex-col items-center justify-center gap-4 w-full">
                            {/* Emoji Top */}
                            {editingSlide.emoji && editingSlide.emojiPosition === 'top' && (
                              <div className="text-center" style={{ lineHeight: 1 }}>
                                {editingSlide.isCustomIcon ? (
                                  <img
                                    src={editingSlide.emoji}
                                    alt="Custom icon"
                                    style={{
                                      width: `${editingSlide.emojiSize || 60}px`,
                                      height: `${editingSlide.emojiSize || 60}px`,
                                      objectFit: 'contain',
                                    }}
                                  />
                                ) : (
                                  <span style={{ fontSize: `${editingSlide.emojiSize || 60}px` }}>
                                    {editingSlide.emoji}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Text */}
                            <h1
                              className="text-center whitespace-pre-line break-words w-full"
                              style={{
                                ...textStyle,
                                fontSize: `${editingSlide.fontSize}px`,
                                fontFamily: editingSlide.fontFamily || 'system-ui, -apple-system, sans-serif',
                                fontWeight: editingSlide.fontWeight || 700,
                                lineHeight: 1.3,
                              }}
                            >
                              {editingSlide.animation === 'reveal' ? (
                                editingSlide.text.split(/(\s+)/).map((word, index) => (
                                  word.trim() ? (
                                    <motion.span
                                      key={index}
                                      variants={wordVariants}
                                      style={{ display: 'inline-block', marginRight: '0.25em' }}
                                    >
                                      {word}
                                    </motion.span>
                                  ) : ' '
                                ))
                              ) : (
                                editingSlide.text || 'Enter your text...'
                              )}
                            </h1>

                            {/* Emoji Bottom */}
                            {editingSlide.emoji && editingSlide.emojiPosition === 'bottom' && (
                              <div className="text-center" style={{ lineHeight: 1 }}>
                                {editingSlide.isCustomIcon ? (
                                  <img
                                    src={editingSlide.emoji}
                                    alt="Custom icon"
                                    style={{
                                      width: `${editingSlide.emojiSize || 60}px`,
                                      height: `${editingSlide.emojiSize || 60}px`,
                                      objectFit: 'contain',
                                    }}
                                  />
                                ) : (
                                  <span style={{ fontSize: `${editingSlide.emojiSize || 60}px` }}>
                                    {editingSlide.emoji}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </>
  );
}
