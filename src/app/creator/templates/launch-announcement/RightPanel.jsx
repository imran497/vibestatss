import { useEffect, useRef, useState } from 'react';
import { Download, RefreshCcw } from 'lucide-react';
import { recordVideo } from './video-recorder';

export default function RightPanel({ config }) {
  const previewRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure client-side only rendering to prevent hydration errors
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Restart animation when any config changes
  useEffect(() => {
    if (!isMounted) return;
    setResetKey(prev => prev + 1);
    setAnimationProgress(0);
  }, [config, isMounted]);

  // Animation loop for preview (client-side only)
  useEffect(() => {
    if (!isMounted) return;

    const startTime = Date.now();
    const duration = config.duration * 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [resetKey, config.duration, isMounted]);


  const handleRestart = () => {
    setResetKey(prev => prev + 1);
    setAnimationProgress(0);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Convert external images to data URLs to avoid CORS issues
      const convertToDataURL = async (imageUrl) => {
        if (!imageUrl) return null;

        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';

          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            try {
              const dataURL = canvas.toDataURL('image/png');
              resolve(dataURL);
            } catch (err) {
              console.warn('Failed to convert to data URL:', err);
              resolve(null);
            }
          };

          img.onerror = () => {
            console.warn('Failed to load image for conversion:', imageUrl);
            resolve(null);
          };

          // Use proxy for external URLs to avoid CORS issues
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            img.src = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
          } else {
            img.src = imageUrl;
          }
        });
      };

      // Create a config copy with data URLs instead of external URLs
      const productLogoDataURL = await convertToDataURL(config.product.logo);
      const platformLogoDataURL = await convertToDataURL(config.platform.logo);

      const exportConfig = {
        ...config,
        product: {
          ...config.product,
          logo: productLogoDataURL || config.product.logo
        },
        platform: {
          ...config.platform,
          logo: platformLogoDataURL || config.platform.logo
        }
      };

      const videoBlob = await recordVideo(exportConfig);
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.product.name.replace(/\s+/g, '-')}-launch.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getAnimationStyles = () => {
    const totalDuration = config.duration * 1000; // ms
    const elapsed = animationProgress * totalDuration;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    // Multi-bounce easing with sequential reduction
    const easeOutBounce = (t) => {
      const n1 = 7.5625;
      const d1 = 2.75;

      if (t < 1 / d1) {
        return n1 * t * t;
      } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
      } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
      } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
      }
    };

    const styles = {
      screen1: { opacity: 0, transform: 'scale(0) translateY(0)' },
      product: { opacity: 0, transform: 'translateX(-100px)' },
      platform: { opacity: 0, transform: 'translateX(100px)' },
      text: { opacity: 0, transform: 'scale(0)' }
    };

    if (elapsed < 2500) {
      if (elapsed < 800) {
        // Faster bounce: 800ms instead of 1000ms
        const t = easeOutBounce(elapsed / 800);
        styles.screen1 = {
          opacity: 1,
          transform: `scale(${t}) translateY(0px)`
        };
      } else if (elapsed < 2000) {
        styles.screen1 = {
          opacity: 1,
          transform: 'scale(1) translateY(0px)'
        };
      } else {
        const t = (elapsed - 2000) / 500;
        styles.screen1 = {
          opacity: 1 - t,
          transform: `scale(1) translateY(${t * -30}px)`
        };
      }
    } else {
      let t;
      if (elapsed < 5500) {
        t = easeOutCubic((elapsed - 2500) / 3000);
      } else {
        t = 1;
      }

      styles.product = {
        opacity: t,
        transform: `translateX(${(1 - t) * -100}px)`
      };
      styles.text = {
        opacity: t,
        transform: `scale(${t})`
      };
      styles.platform = {
        opacity: t,
        transform: `translateX(${(1 - t) * 100}px)`
      };
    }

    return styles;
  };

  const animStyles = getAnimationStyles();

  return (
    <div className="flex flex-col items-center gap-6 lg:gap-8 w-full h-full justify-center px-4 py-8 lg:py-0">
      <div className="relative group w-full max-w-[600px] lg:w-[600px] h-auto">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl lg:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div
          ref={previewRef}
          className="w-full max-w-[600px] lg:w-[600px] aspect-[16/9] rounded-2xl lg:rounded-[1.8rem] flex items-center justify-center shadow-2xl overflow-hidden relative ring-1 ring-white/10"
          style={{
            backgroundColor: isMounted ? config.colors.background : '#f3f4f6',
            fontFamily: config.font
          }}
          suppressHydrationWarning
        >
          {!isMounted ? (
            <div className="text-gray-400 z-10">Loading preview...</div>
          ) : (
            <>
              {/* Background - Image or Gradient */}
              <div className="absolute inset-0">
                {config.backgroundType === 'image' ? (
                  <>
                    <img
                      src={`/abstract/${config.backgroundImage}.jpg`}
                      alt="Background"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-white/25 backdrop-blur-md"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/20"></div>
                  </>
                ) : (
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(${config.backgroundGradient.direction}, ${config.backgroundGradient.color1}, ${config.backgroundGradient.color2})`
                    }}
                  />
                )}
              </div>

              {/* Content Container */}
              <div className="relative z-10 p-5 w-full h-full flex items-center justify-center">
                <div className="bg-white/80 rounded-2xl w-full h-full flex flex-col items-center justify-center px-8 py-8 relative">
                  {/* Screen 1: Type Text */}
                  <div
                    style={{ ...animStyles.screen1, fontWeight: config.fontWeight }}
                    className="absolute inset-0 flex items-center justify-center"
                    suppressHydrationWarning
                  >
                    <h1 className="text-5xl font-bold" style={{ color: config.colors.text, fontWeight: config.fontWeight }} suppressHydrationWarning>
                      {config.type === 'launching' ? 'Launching' : 'Featuring'}
                    </h1>
                  </div>

                  {/* Screen 2: 3 Line Layout */}
                  <div className="flex flex-col items-center justify-center gap-4">
                    {/* Line 1: Product Logo + Name */}
                    <div
                      style={animStyles.product}
                      className="flex items-center gap-3"
                      suppressHydrationWarning
                    >
                      {config.product.logo ? (
                        <img src={config.product.logo} alt={config.product.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: config.colors.accent, color: config.colors.background }}>
                          {config.product.name.charAt(0)}
                        </div>
                      )}
                      <h2 className="text-3xl font-bold" style={{ color: config.colors.text, fontWeight: config.fontWeight }} suppressHydrationWarning>
                        {config.product.name}
                      </h2>
                    </div>

                    {/* Line 2: "on" Text */}
                    <div
                      style={{ ...animStyles.text, fontWeight: config.fontWeight }}
                      className=""
                      suppressHydrationWarning
                    >
                      <p className="text-xl font-semibold" style={{ color: config.colors.secondary, fontWeight: config.fontWeight }} suppressHydrationWarning>
                        on
                      </p>
                    </div>

                    {/* Line 3: Platform Logo + Name */}
                    <div
                      style={animStyles.platform}
                      className="flex items-center gap-3"
                      suppressHydrationWarning
                    >
                      {config.platform.logo ? (
                        <img src={config.platform.logo} alt={config.platform.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold" style={{ backgroundColor: config.colors.secondary, color: config.colors.text }}>
                          {config.platform.name.charAt(0)}
                        </div>
                      )}
                      <h2 className="text-3xl font-bold" style={{ color: config.colors.text, fontWeight: config.fontWeight }} suppressHydrationWarning>
                        {config.platform.name}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Control Buttons Container */}
      <div className="flex gap-3 lg:gap-4 flex-wrap justify-center">
        <button
          onClick={handleRestart}
          disabled={isExporting}
          className="px-4 lg:px-6 py-3 lg:py-4 text-primary-foreground bg-slate-800 rounded-full font-bold text-base lg:text-lg hover:bg-primary/90 transition-all backdrop-blur-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCcw className="w-5 h-5 lg:w-6 lg:h-6" />
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="group relative px-6 lg:px-8 py-3 lg:py-4 bg-white text-black rounded-full font-bold text-base lg:text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Download className="w-5 h-5 lg:w-6 lg:h-6" />
            {isExporting ? 'Exporting...' : 'Export MP4'}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity"></div>
        </button>
      </div>
    </div>
  );
}
