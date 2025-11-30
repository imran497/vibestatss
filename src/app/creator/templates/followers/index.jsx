'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';
import { Outfit, Inter, Playfair_Display, Space_Mono, Space_Grotesk } from 'next/font/google';
import LeftPanel from '@/app/creator/templates/followers/LeftPanel';
import RightPanel from '@/app/creator/templates/followers/RightPanel';

const outfit = Outfit({ subsets: ['latin'] });
const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'] });
const spaceMono = Space_Mono({ weight: ['400', '700'], subsets: ['latin'] });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] });

export const fonts = {
  'Outfit': outfit.className,
  'Inter': inter.className,
  'Playfair': playfair.className,
  'Space Mono': spaceMono.className,
};

export default function Followers({ templateId = 1, templateName = 'Number Milestone' }) {
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
    <main className={`flex h-screen overflow-hidden ${outfit.className}`}>
      {/* Left Panel: Configuration */}
      <div className="w-[400px] h-screen border-r border-border bg-card overflow-y-auto flex-shrink-0">
        {/* Logo */}
        <div className="sticky top-0 bg-card z-10 px-8 py-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <TrendingUp className="w-5 h-5 text-foreground group-hover:translate-y-[-2px] transition-transform" />
            <span className={`text-xl font-bold tracking-tight text-foreground ${spaceGrotesk.className}`}>
              VibeStatss
            </span>
          </Link>
        </div>

        <div className="px-8 py-6">
          <LeftPanel
            config={config}
            setConfig={setConfig}
            templateId={templateId}
            templateName={templateName}
          />
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-background">
        {/* Ambient Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative z-10">
          <RightPanel config={config} fonts={fonts} />
        </div>
      </div>
    </main>
  );
}
