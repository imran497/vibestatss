'use client';

import { useRouter } from 'next/navigation';
import { X, TrendingUp, Check, BadgeCheck } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import FollowerCountPreview from '../templateModalPreview/FollowerCountPreview';

const AVAILABLE_TEMPLATES = [
  {
    id: 1,
    name: 'Number Milestone',
    description: 'Animated follower milestone celebrations',
    icon: TrendingUp,
    isActive: true,
  },
  {
    id: 2,
    name: 'X Verified Followers',
    description: 'Showcase verified follower stats',
    icon: BadgeCheck,
    isActive: true,
  },
];

export default function TemplateSelectorModal({ isOpen, onClose, currentTemplate = 1 }) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleTemplateSelect = (template) => {
    if (template.isActive) {
      // Navigate to the template page
      router.push(`/creator/${template.id}`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold">Choose a Template</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a template to start creating your video
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_TEMPLATES.map((template) => {
              const isSelected = template.id === currentTemplate;
              const isDisabled = !template.isActive;

              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  disabled={isDisabled}
                  className={`
                    relative rounded-xl border-2 overflow-hidden transition-all group
                    ${isSelected
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border hover:border-primary/50'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <Check size={14} className="text-primary-foreground" />
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="aspect-video relative bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center overflow-hidden">
                    {/* Follower Count Preview */}
                    {template.id === 1 && (
                      <FollowerCountPreview isVisible={isOpen} />
                    )}

                    {/* X Verified Followers Preview */}
                    {template.id === 2 && (
                      <div className="flex items-center gap-3 text-white">
                        <BadgeCheck className="w-8 h-8" style={{ color: 'rgb(30, 156, 241)' }} />
                        <div className="text-4xl font-bold">850 / 1000</div>
                      </div>
                    )}

                    {/* Overlay gradient for title readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Template Title Overlay */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <h3 className="text-base font-bold text-white drop-shadow-lg">
                        {template.name}
                      </h3>
                    </div>

                    {/* Coming Soon Overlay */}
                    {isDisabled && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-white/10 text-white border border-white/20">
                          Coming Soon
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Coming Soon Message */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <p className="text-sm font-medium text-muted-foreground">
                  More templates coming soon! Stay tuned for daily updates, progress trackers, and more.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
