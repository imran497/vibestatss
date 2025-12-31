'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, TrendingUp, Check, BadgeCheck, BarChart3, Type, GitBranch, Crown, Rocket } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '@/app/hooks/useAuth';
import FollowerCountPreview from '../templateModalPreview/FollowerCountPreview';

const AVAILABLE_TEMPLATES = [
  {
    id: 1,
    name: 'Number Milestone',
    description: 'Animated follower milestone celebrations',
    icon: TrendingUp,
    isActive: true,
    isPremium: false,
  },
  {
    id: 2,
    name: 'X Verified Followers',
    description: 'Showcase verified follower stats',
    icon: BadgeCheck,
    isActive: true,
    isPremium: true,
  },
  {
    id: 3,
    name: 'X Analytics',
    description: 'Showcase your X (Twitter) analytics with stunning cards',
    icon: BarChart3,
    isActive: true,
    isPremium: true,
  },
  {
    id: 4,
    name: 'Text Videos',
    description: 'Create animated text videos with custom styling and effects',
    icon: Type,
    isActive: true,
    isPremium: false,
  },
  {
    id: 5,
    name: 'GitHub Heatmap',
    description: 'Animated GitHub contribution heatmap with bubble pop effects',
    icon: GitBranch,
    isActive: true,
    isPremium: true,
  },
  {
    id: 6,
    name: 'Launch Announcement',
    description: 'Create stunning product launch videos for any platform',
    icon: Rocket,
    isActive: true,
    isPremium: true,
  },
];

export default function TemplateSelectorModal({ isOpen, onClose, currentTemplate = 1 }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  // Determine initial tab based on current template
  const currentTemplateObj = AVAILABLE_TEMPLATES.find(t => t.id === currentTemplate);
  const initialTab = currentTemplateObj?.isPremium ? 'premium' : 'free';
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const handleTemplateSelect = (template) => {
    if (!template.isActive) return;

    // Check if template is premium and user is not authenticated
    if (template.isPremium && !isAuthenticated && !loading) {
      // Store the template ID to redirect after login
      localStorage.setItem('pendingTemplateId', template.id.toString());
      localStorage.setItem('returnUrl', `/creator/${template.id}`);

      // Redirect to login
      window.location.href = '/login';
      return;
    }

    // Navigate to the template page
    router.push(`/creator/${template.id}`);
    onClose();
  };

  // Filter templates based on active tab
  const filteredTemplates = AVAILABLE_TEMPLATES.filter(template =>
    activeTab === 'free' ? !template.isPremium : template.isPremium
  );

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

        {/* Tabs */}
        <div className="px-6 pt-4 border-b border-border">
          <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('free')}
              className={`flex-1 px-4 py-2.5 rounded-md font-medium text-sm transition-all ${
                activeTab === 'free'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Free Templates
            </button>
            <button
              onClick={() => setActiveTab('premium')}
              className={`flex-1 px-4 py-2.5 rounded-md font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'premium'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Crown size={14} className="text-yellow-500" />
              Premium Templates
            </button>
          </div>
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
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
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/20 shadow-lg shadow-primary/10 opacity-100'
                      : 'border-muted-foreground/20 bg-card hover:border-primary/60 hover:shadow-md hover:scale-[1.02] opacity-80 hover:opacity-100'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-lg">
                        <Crown size={12} className="text-white" />
                        <span className="text-xs font-bold text-white">Premium</span>
                      </div>
                    </div>
                  )}

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg ring-2 ring-background">
                        <Check size={16} className="text-primary-foreground font-bold" strokeWidth={3} />
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

                    {/* X Analytics Preview */}
                    {template.id === 3 && (
                      <div className="grid grid-cols-2 gap-2 px-4">
                        <div className="bg-gray-800/80 rounded-lg p-2 border border-gray-700">
                          <div className="text-xs text-gray-400">Impressions</div>
                          <div className="text-lg font-bold text-white">3.2k</div>
                        </div>
                        <div className="bg-gray-800/80 rounded-lg p-2 border border-gray-700">
                          <div className="text-xs text-gray-400">Engagements</div>
                          <div className="text-lg font-bold text-white">422</div>
                        </div>
                        <div className="bg-gray-800/80 rounded-lg p-2 border border-gray-700">
                          <div className="text-xs text-gray-400">Likes</div>
                          <div className="text-lg font-bold text-white">155</div>
                        </div>
                        <div className="bg-gray-800/80 rounded-lg p-2 border border-gray-700">
                          <div className="text-xs text-gray-400">Replies</div>
                          <div className="text-lg font-bold text-white">114</div>
                        </div>
                      </div>
                    )}

                    {/* Daily Update Preview */}
                    {template.id === 4 && (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <h2 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                            Day 1
                          </h2>
                          <p className="text-sm text-gray-400 mt-2">of Building</p>
                        </div>
                      </div>
                    )}

                    {/* GitHub Heatmap Preview */}
                    {template.id === 5 && (
                      <div className="flex items-center justify-center h-full p-4">
                        <div className="grid grid-cols-7 gap-1">
                          {[...Array(35)].map((_, i) => {
                            const colors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
                            const colorIndex = Math.floor(Math.random() * colors.length);
                            return (
                              <div
                                key={i}
                                className="w-2 h-2 rounded-sm"
                                style={{ backgroundColor: colors[colorIndex] }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Launch Announcement Preview */}
                    {template.id === 6 && (
                      <div className="flex items-center justify-center h-full p-6">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 w-full max-w-[85%]">
                          <div className="flex flex-col items-center gap-2">
                            {/* Product */}
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                                V
                              </div>
                              <span className="text-lg font-bold text-gray-900">VibeStatss</span>
                            </div>

                            {/* On Text */}
                            <span className="text-xs text-gray-600 font-semibold">on</span>

                            {/* Platform */}
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                P
                              </div>
                              <span className="text-lg font-bold text-gray-900">Product Hunt</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Overlay gradient for title readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Template Title Overlay */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white drop-shadow-lg">
                          {template.name}
                        </h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full shadow-lg">
                            Current
                          </span>
                        )}
                      </div>
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

                  {/* Description */}
                  <div className={`p-3 transition-colors ${
                    isSelected ? 'bg-primary/5' : 'bg-muted/30 group-hover:bg-muted/50'
                  }`}>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
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
