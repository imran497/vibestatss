'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Outfit } from 'next/font/google';
import LeftPanel from './LeftPanel';
import RightPanel from './RightPanel';
import UserDropdown from '@/app/components/UserDropdown';
import MobileMenu from '@/app/components/MobileMenu';

const outfit = Outfit({ subsets: ['latin'] });

export default function DailyUpdate({ templateId = 4, templateName = 'Text Videos' }) {
  const [showMobileEdit, setShowMobileEdit] = useState(false);
  const [config, setConfig] = useState({
    textSlides: [
      {
        id: 1,
        text: 'Day 1 of Building',
        animation: 'fade',
        textColors: ['#FFFFFF', '#FFFFFF'], // Solid white (both colors same for solid)
        isGradient: false,
        duration: 2, // Duration for this slide in seconds
        fontSize: 35, // Font size for this slide (20-80)
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 700,
        bgColors: ['#000000', '#1a1a1a'], // Background for this slide
        bgIsGradient: false,
        hasCustomBg: false,
        emoji: '',
        emojiSize: 60,
        emojiPosition: 'top',
      },
      {
        id: 2,
        text: 'Just Shipped v1.0',
        animation: 'slideUp',
        textColors: ['#FFD700', '#FFA500'], // Gold gradient
        isGradient: true,
        duration: 2,
        fontSize: 35,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 700,
        bgColors: ['#000000', '#1a1a1a'],
        bgIsGradient: false,
        hasCustomBg: false,
        emoji: '',
        emojiSize: 60,
        emojiPosition: 'top',
      },
      {
        id: 3,
        text: 'Follow for More Updates',
        animation: 'zoom',
        textColors: ['#FFFFFF', '#FFFFFF'],
        isGradient: false,
        duration: 2,
        fontSize: 35,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 700,
        bgColors: ['#000000', '#1a1a1a'],
        bgIsGradient: false,
        hasCustomBg: false,
        emoji: '',
        emojiSize: 60,
        emojiPosition: 'top',
      },
    ],
    bgColors: ['#000000', '#1a1a1a'], // Background gradient
    bgIsGradient: false,
    export: {
      width: 1200,
      height: 675, // 16:9 for horizontal video (Twitter)
      fps: 60,
    },
  });

  return (
    <main className={`flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden ${outfit.className}`}>
      <MobileMenu />

      {/* Desktop Recommendation Banner - Mobile Only */}
      <div className="lg:hidden bg-primary/10 border-b border-primary/20 px-4 py-3 text-sm text-center sticky top-0 z-40">
        💡 <span className="font-medium">Best viewed on desktop</span> for the full experience
      </div>

      {/* Mobile Edit Panel */}
      {showMobileEdit && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowMobileEdit(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-[85%] max-w-[400px] bg-card border-r border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold">Edit Video</h2>
              <button
                onClick={() => setShowMobileEdit(false)}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <LeftPanel
                config={config}
                setConfig={setConfig}
                templateId={templateId}
                templateName={templateName}
              />
            </div>
          </div>
        </>
      )}

      {/* Left Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-[400px] lg:h-screen border-r border-border bg-card flex-col flex-shrink-0">
        <div className="sticky top-0 bg-card z-10 px-8 py-6 border-b border-border">
          <Link href="/" className="group inline-block">
            <Image
              src="/VibeLogo_black.svg"
              alt="VibeStatss"
              width={130}
              height={35}
              className="h-7 w-auto group-hover:opacity-80 transition-opacity"
              priority
            />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <LeftPanel
            config={config}
            setConfig={setConfig}
            templateId={templateId}
            templateName={templateName}
          />
        </div>

        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-3">
          <UserDropdown position="top" />
        </div>
      </div>

      {/* Floating Edit Button - Mobile Only */}
      <button
        onClick={() => setShowMobileEdit(true)}
        className="lg:hidden fixed bottom-6 left-6 z-30 flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>

      {/* Right Panel: Preview */}
      <div className="flex-1 flex items-center justify-center relative lg:overflow-hidden bg-background min-h-[600px] lg:min-h-0">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 w-full">
          <RightPanel config={config} />
        </div>
      </div>
    </main>
  );
}
