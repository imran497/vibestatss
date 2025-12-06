'use client';

import { useRef, useState } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import VideoBox from './VideoBox';
import { recordVideo } from './video-recorder';

export default function RightPanel({ config, fonts }) {
  const previewRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const handleExport = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      console.log('🎬 Starting MP4 video generation...');
      console.log('Config:', config);

      const blob = await recordVideo(config);

      console.log('✅ Video generated successfully!');
      console.log('Blob details:', {
        size: blob.size,
        type: blob.type,
        readable: blob.size > 0
      });

      if (blob.size === 0) {
        throw new Error('Generated video is empty (0 bytes)');
      }

      // Download the video
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `verified-followers-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("❌ Export failed:", err);

      if (err.message === 'MP4_NOT_SUPPORTED') {
        alert('MP4 export is not supported in your browser. Please try using Chrome or Edge.');
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
  const aspectRatio = config.export.width / config.export.height;

  return (
    <div className="flex flex-col items-center gap-6 lg:gap-8 w-full h-full justify-center px-4 py-8 lg:py-0">
      {/* Card Glow Effect */}
      <div
        className={`relative group w-full h-auto ${
          isVertical
            ? 'max-w-[280px] lg:max-w-[320px] max-h-[70vh]'
            : 'max-w-[600px] lg:max-w-[650px]'
        }`}
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl lg:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div
          ref={previewRef}
          className="w-full rounded-2xl lg:rounded-[1.8rem] shadow-2xl overflow-hidden relative ring-1 ring-white/10"
          style={{
            backgroundColor: config.colors.background,
            aspectRatio: aspectRatio,
          }}
        >
          <VideoBox config={config} fonts={fonts} key={resetKey} />
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
