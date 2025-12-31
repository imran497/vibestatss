'use client';

import { useRouter } from 'next/navigation';
import { TrendingUp, BadgeCheck, BarChart3, Type, GitBranch, Rocket, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/app/components/ui/carousel';

export const AVAILABLE_TEMPLATES = [
  {
    id: 1,
    name: 'Number Milestone',
    description: 'Animated follower celebrations',
    icon: TrendingUp,
    isPremium: false,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div className="relative">
          <div className="text-white text-4xl font-bold">100K</div>
          <div className="text-white/80 text-xs text-center mt-1">FOLLOWERS</div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    name: 'X Verified Followers',
    description: 'Verified follower stats',
    icon: BadgeCheck,
    isPremium: true,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-slate-800 to-slate-950 rounded-t-lg flex items-center justify-center gap-3 relative">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2">
          <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-400" />
          <div className="text-white text-2xl font-bold">2.5K</div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    name: 'X Analytics',
    description: 'Twitter analytics cards',
    icon: BarChart3,
    isPremium: true,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-slate-900 to-black rounded-t-lg p-3 flex items-center justify-center">
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-2 w-full">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-6 bg-blue-500 rounded"></div>
            <div className="text-white text-[10px] font-semibold">Impressions</div>
          </div>
          <div className="text-white text-lg font-bold ml-3">1.2M</div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    name: 'Text Videos',
    description: 'Animated text videos',
    icon: Type,
    isPremium: false,
    preview: (
      <div className="w-full h-24 rounded-t-lg relative overflow-hidden">
        {/* Background Image Simulation */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600"></div>
        <div className="absolute inset-0 bg-white/25 backdrop-blur-sm"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/20"></div>

        {/* White Overlay Box */}
        <div className="absolute inset-0 p-2 flex items-center justify-center">
          <div className="bg-white/80 rounded-lg w-full h-full flex items-center justify-center px-3 py-2">
            <div className="text-gray-900 text-lg font-bold text-center leading-tight">
              Day 1 of<br/>Building
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    name: 'GitHub Heatmap',
    description: 'Contribution heatmap',
    icon: GitBranch,
    isPremium: true,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-slate-900 to-black rounded-t-lg p-3 flex flex-col justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-white" />
          <div className="text-white text-[10px] font-semibold">Contributions</div>
        </div>
        <div className="flex items-end gap-0.5 h-12">
          {[3, 5, 2, 7, 4, 6, 3, 8, 5, 4, 6].map((height, i) => (
            <div key={i} className="flex-1 bg-green-500 rounded-sm transition-all" style={{ height: `${height * 10}%`, opacity: 0.4 + (height / 10) * 0.6 }}></div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 6,
    name: 'Launch Announcement',
    description: 'Product launch videos',
    icon: Rocket,
    isPremium: true,
    preview: (
      <div className="w-full h-24 rounded-t-lg relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500"></div>
        <div className="absolute inset-0 bg-white/25 backdrop-blur-sm"></div>

        {/* White Box */}
        <div className="absolute inset-0 p-2 flex items-center justify-center">
          <div className="bg-white/80 rounded-lg w-full h-full flex flex-col items-center justify-center gap-1 px-2">
            <Rocket className="w-5 h-5 text-purple-600" />
            <div className="text-gray-900 text-[10px] font-semibold text-center">Launching on</div>
            <div className="text-gray-900 text-xs font-bold text-center">Product Hunt</div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function TemplateCarousel({ currentTemplate = 1 }) {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const handleTemplateSelect = (template) => {
    if (template.id === currentTemplate) return; // Already on this template

    // Check if template is premium and user is not authenticated
    if (template.isPremium && !isAuthenticated && !loading) {
      localStorage.setItem('pendingTemplateId', template.id.toString());
      localStorage.setItem('returnUrl', `/creator/${template.id}`);
      window.location.href = '/login';
      return;
    }

    // Navigate to the template page
    router.push(`/creator/${template.id}`);
  };

  // Find current template index
  const currentIndex = AVAILABLE_TEMPLATES.findIndex(t => t.id === currentTemplate);

  return (
    <div className="w-full px-8 relative">
      <Carousel
        opts={{
          align: "center",
          loop: true,
          startIndex: currentIndex,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {AVAILABLE_TEMPLATES.map((template) => {
            const Icon = template.icon;
            const isActive = template.id === currentTemplate;

            return (
              <CarouselItem key={template.id} className="pl-4 basis-[70%]">
                <button
                  onClick={() => handleTemplateSelect(template)}
                  className={`w-full rounded-xl border-2 transition-all duration-300 overflow-hidden relative ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50 opacity-40'
                  }`}
                >
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 shadow-md">
                        <Crown className="w-2.5 h-2.5 text-white" />
                        <span className="text-[9px] font-bold text-white">PRO</span>
                      </div>
                    </div>
                  )}

                  {/* Preview */}
                  <div className="w-full">
                    {template.preview}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-xs">{template.name}</h3>
                          {template.isPremium && (
                            <Crown className="w-3 h-3 text-yellow-500" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground line-clamp-1">
                          {template.description}
                        </p>
                      </div>

                      {isActive && (
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                  </div>
                </button>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        <CarouselPrevious className="-left-8" />
        <CarouselNext className="-right-8" />
      </Carousel>
    </div>
  );
}
