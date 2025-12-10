'use client';

import { useState } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import VideoBox from './VideoBox';
import { recordVideo } from './video-recorder';

export default function RightPanel({ config }) {
  const [resetKey, setResetKey] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    console.log('🎬 Starting export...');

    try {
      const blob = await recordVideo(config);

      // Download the video
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `x-analytics-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Export failed:", err);

      if (err.message === 'MP4_NOT_SUPPORTED' || err.message?.includes('Video Encoder') || err.message?.includes('VideoEncoder')) {
        alert('Video export is only available on desktop browsers.\n\nPlease use Chrome, Edge, or Firefox on a desktop/laptop to export your video.');
      } else {
        alert(`Export failed: ${err.message}\n\nCheck console for details.`);
      }
    } finally {
      setIsExporting(false);
      setResetKey(prev => prev + 1); // Reset preview animation
    }
  };

  // Calculate if aspect ratio is vertical (portrait)
  const isVertical = config.export.height > config.export.width;

  return (
    <div className="flex flex-col items-center gap-6 lg:gap-8 w-full h-full justify-center px-4 py-8 lg:py-0">
      {/* Card Glow Effect */}
      <div
        className={`relative group w-full h-auto ${
          isVertical ? 'max-w-md' : 'max-w-3xl'
        }`}
      >
        {/* Glow */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>

        {/* Preview */}
        <div key={resetKey} className="relative">
          <VideoBox config={config} />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 lg:gap-4 flex-wrap justify-center">
        <button
          onClick={() => setResetKey(prev => prev + 1)}
          className="px-4 lg:px-6 py-3 lg:py-4 text-primary-foreground bg-slate-800 rounded-full font-bold text-base lg:text-lg hover:bg-primary/90 transition-all backdrop-blur-sm cursor-pointer"
          title="Replay animation"
        >
          <RefreshCcw className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="group relative px-6 lg:px-8 py-3 lg:py-4 bg-white text-black rounded-full font-bold text-base lg:text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity rounded-full"></div>
          <span className="relative z-10 flex items-center gap-2">
            {isExporting ? (
              'Exporting...'
            ) : (
              <>
                <Download size={18} className="lg:w-5 lg:h-5" />
                <span className="hidden sm:inline">Export MP4</span>
                <span className="sm:hidden">Export</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
