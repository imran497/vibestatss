'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Outfit, Inter, Playfair_Display, Space_Mono } from 'next/font/google';
import LeftPanel from '@/app/creator/templates/followers/LeftPanel';
import RightPanel from '@/app/creator/templates/followers/RightPanel';
import UserDropdown from '@/app/components/UserDropdown';
import MobileMenu from '@/app/components/MobileMenu';

const outfit = Outfit({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'] });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'] });

export const fonts = {
  'Outfit': outfit.className,
  'Inter': inter.className,
  'Playfair': playfair.className,
  'Space Mono': spaceMono.className,
};

export default function Followers({ templateId = 1, templateName = 'Number Milestone' }) {
  const [showMobileEdit, setShowMobileEdit] = useState(false);
  const [config, setConfig] = useState({
    self: { start: 0, end: 1000, duration: 2, label: 'Followers', labelPosition: 'above' },
    image: {
      category: 'none', // none, twitter, custom
      selectedId: null, // ID from image registry
      customImageUrl: null, // Base64 or URL for custom uploaded image
      position: 'top-left' // top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
    },
    confetti: 'side-burst', // side-burst, cannon, stars
    music: 'none', // none, upbeat, calm, epic, inspiring
    // Export settings - single source of truth for video quality
    export: {
      width: 1920,
      height: 1080,
      fps: 60,
      confettiDuration: 8 // seconds
    },
    style: {
      font: 'Outfit',
      background: {
        type: 'solid',
        color1: '#252525',
        color2: '#1a1a1a',
        direction: 'to bottom right'
      },
      text: {
        type: 'gradient',
        color1: '#c49300', // blue-400
        color2: '#f97316', // purple-600
        direction: 'to right'
      }
    }
  });

  return (
    <main className={`flex flex-col lg:flex-row min-h-screen lg:h-screen lg:overflow-hidden ${outfit.className}`}>
      {/* Mobile Menu */}
      <MobileMenu />

      {/* Desktop Recommendation Banner - Mobile Only */}
      <div className="lg:hidden bg-primary/10 border-b border-primary/20 px-4 py-3 text-sm text-center sticky top-0 z-40">
        💡 <span className="font-medium">Best viewed on desktop</span> for the full experience
      </div>

      {/* Mobile Edit Panel - Slide-in */}
      {showMobileEdit && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowMobileEdit(false)}
          />
          {/* Slide-in Panel */}
          <div className="lg:hidden fixed inset-y-0 left-0 w-[85%] max-w-[400px] bg-card border-r border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-left duration-300">
            {/* Header */}
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
            {/* Content */}
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

      {/* Left Panel: Configuration - Desktop Only */}
      <div className="hidden lg:flex lg:w-[400px] lg:h-screen border-r border-border bg-card flex-col flex-shrink-0">
        {/* Logo */}
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

        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <LeftPanel
            config={config}
            setConfig={setConfig}
            templateId={templateId}
            templateName={templateName}
          />
        </div>

        {/* User Dropdown - Desktop Only */}
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
        {/* Ambient Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10 w-full">
          <RightPanel config={config} fonts={fonts} />
        </div>
      </div>
    </main>
  );
}
