import { useEffect, useRef, useState, useCallback } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';
import { recordVideo } from './video-recorder';
import { MUSIC_LIBRARY } from '../../../lib/music-library';
import VideoBox from './VideoBox';

// Helper function to convert direction strings to CSS gradient direction
const getDirection = (direction) => {
  return direction || 'to right';
};

export default function RightPanel({ config, fonts }) {
  const previewRef = useRef(null);
  const audioRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Restart animation when music changes
  useEffect(() => {
    setResetKey(prev => prev + 1);
  }, [config.music]);

  // Clean up and restart when animation resets
  useEffect(() => {
    // Remove any existing confetti canvases
    if (previewRef.current) {
      const oldCanvases = previewRef.current.querySelectorAll('canvas');
      oldCanvases.forEach(canvas => canvas.remove());
    }

    // Reset and play audio
    if (config.music && config.music !== 'none') {
      const musicUrl = MUSIC_LIBRARY[config.music];
      if (musicUrl && audioRef.current) {
        audioRef.current.src = musicUrl;
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
          console.log('Audio playback failed:', err.message);
        });
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [resetKey, config.music]);

  // Generate confetti colors based on text color
  const generateConfettiColors = useCallback((textStyle) => {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 139, g: 92, b: 246 }; // fallback purple
    };

    const rgbToHex = (r, g, b) => {
      return "#" + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      }).join('');
    };

    const interpolateColor = (color1, color2, factor) => {
      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);
      return rgbToHex(
        c1.r + (c2.r - c1.r) * factor,
        c1.g + (c2.g - c1.g) * factor,
        c1.b + (c2.b - c1.b) * factor
      );
    };

    const adjustBrightness = (hex, percent) => {
      const rgb = hexToRgb(hex);
      return rgbToHex(
        Math.min(255, rgb.r * (1 + percent)),
        Math.min(255, rgb.g * (1 + percent)),
        Math.min(255, rgb.b * (1 + percent))
      );
    };

    if (textStyle.type === 'gradient') {
      // Use gradient colors and interpolate between them
      return [
        textStyle.color1,
        interpolateColor(textStyle.color1, textStyle.color2, 0.33),
        interpolateColor(textStyle.color1, textStyle.color2, 0.5),
        interpolateColor(textStyle.color1, textStyle.color2, 0.66),
        textStyle.color2
      ];
    } else {
      // Generate variations of the solid color
      const baseColor = textStyle.color1;
      return [
        adjustBrightness(baseColor, -0.3),
        adjustBrightness(baseColor, -0.15),
        baseColor,
        adjustBrightness(baseColor, 0.15),
        adjustBrightness(baseColor, 0.3)
      ];
    }
  }, []);

  const fireConfetti = useCallback((isExportingMode = false) => {
    if (!previewRef.current) return;

    console.log('🎉 Firing confetti:', { isExporting: isExportingMode, timestamp: Date.now() });

    // Create canvas inside preview for confetti
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '50';
    canvas.width = config.export?.width || 1920;
    canvas.height = config.export?.height || 1080;
    previewRef.current.appendChild(canvas);

    const myConfetti = confetti.create(canvas, {
      resize: false,
      useWorker: false // Disable worker for better sync with export
    });

    const colors = generateConfettiColors(config.style.text);
    const confettiType = config.confetti || 'side-burst';

    // Different confetti firing patterns
    const fireSideBurst = () => {
      myConfetti({
        particleCount: 30,
        angle: 60,
        spread: 150,
        origin: { x: 0.2 },
        colors,
        ticks: 8000,
        gravity: 1.2,
        scalar: 2.5,
        drift: 0,
        shapes: ['square', 'circle'], // Mix of ribbons and particles
      });
      myConfetti({
        particleCount: 30,
        angle: 120,
        spread: 150,
        origin: { x: 0.8 },
        colors,
        ticks: 8000,
        gravity: 1.2,
        scalar: 2.5,
        drift: 0,
        shapes: ['square', 'circle'], // Mix of ribbons and particles
      });
    };

    const fireCannon = () => {
      myConfetti({
        particleCount: 50,
        angle: 90,
        spread: 60,
        origin: { x: 0.5, y: 1 },
        colors,
        ticks: 8000,
        gravity: 1.0,
        scalar: 3,
        drift: 0,
        shapes: ['square', 'circle'], // Mix of ribbons and particles
      });
    };

    const fireStars = () => {
      for (let i = 0; i < 3; i++) {
        myConfetti({
          particleCount: 15,
          angle: 60 + (i * 30),
          spread: 55,
          origin: { x: 0.2 + (i * 0.3), y: 0.6 },
          colors,
          ticks: 6000,
          gravity: 0.8,
          scalar: 1.5,
          drift: 0,
          shapes: ['star'],
        });
      }
    };

    // Select fire function based on type
    const fire = confettiType === 'cannon' ? fireCannon :
                 confettiType === 'stars' ? fireStars :
                 fireSideBurst;

    // Fire multiple bursts over the confetti duration
    fire();                         // t=0ms
    setTimeout(fire, 150);          // t=150ms
    setTimeout(fire, 300);          // t=300ms
    setTimeout(fire, 1000);         // t=1s
    setTimeout(fire, 1500);         // t=1.5s
    setTimeout(fire, 2000);         // t=2s
    setTimeout(fire, 2500);         // t=2.5s
    setTimeout(fire, 3000);         // t=3s

    console.log(`  Total confetti bursts: 8 (${confettiType})`);

    // Remove canvas after animation
    setTimeout(() => {
      canvas.remove();
    }, isExportingMode ? 10000 : 6000);
  }, [config.style.text, generateConfettiColors]);

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
      downloadBlob(blob, 'mp4');
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

  const downloadBlob = (blob, ext = 'webm') => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibestatss-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url); // Clean up
  };

  const bgStyle = config.style.background.type === 'gradient'
    ? { backgroundImage: `linear-gradient(${getDirection(config.style.background.direction)}, ${config.style.background.color1}, ${config.style.background.color2})` }
    : { backgroundColor: config.style.background.color1 };

  return (
    <div className="flex flex-col items-center gap-6 lg:gap-8 w-full h-full justify-center px-4 py-8 lg:py-0">
      {/* Card Glow Effect */}
      <div className="relative group w-full max-w-[600px] lg:w-[600px] h-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl lg:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div
          ref={previewRef}
          className={`w-full max-w-[600px] lg:w-[600px] aspect-[16/9] rounded-2xl lg:rounded-[1.8rem] flex items-center justify-center shadow-2xl overflow-hidden relative ring-1 ring-white/10 ${fonts[config.style.font]}`}
          style={bgStyle}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

          <VideoBox
            start={config.self.start}
            end={config.self.end}
            duration={config.self.duration}
            label={config.self.label}
            labelPosition={config.self.labelPosition}
            image={config.image}
            style={config.style}
            resetKey={resetKey}
            onComplete={fireConfetti}
          />
        </div>
      </div>

      <div className="flex gap-3 lg:gap-4 flex-wrap justify-center">
        <button
          onClick={() => setResetKey(prev => prev + 1)}
          className="px-4 lg:px-6 py-3 lg:py-4 text-primary-foreground bg-slate-800 rounded-full font-bold text-base lg:text-lg hover:bg-primary/90 transition-all backdrop-blur-sm cursor-pointer"
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

      {/* Hidden audio element for preview playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
}
