'use client';

import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { fireConfetti as fireConfettiShared, previewConfettiBurstConfig, formatCount } from './confettiConfig';

export default function VideoBox({ config }) {
  const [animationKey, setAnimationKey] = useState(0);
  const [visibleChars, setVisibleChars] = useState(0);
  const containerRef = useRef(null);
  const confettiCanvasRef = useRef(null);
  const confettiInstanceRef = useRef(null);
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    // Setup confetti canvas
    if (containerRef.current && !confettiInstanceRef.current) {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'absolute';
      canvas.style.inset = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '1'; // Behind the numbers
      canvas.width = containerRef.current.offsetWidth;
      canvas.height = containerRef.current.offsetHeight;
      containerRef.current.appendChild(canvas);
      confettiCanvasRef.current = canvas;

      confettiInstanceRef.current = confetti.create(canvas, {
        resize: false,
        useWorker: false,
      });
    }

    // Reset animation
    setAnimationKey(prev => prev + 1);
    setVisibleChars(0);
    confettiFiredRef.current = false;

    const verifiedStr = formatCount(config.verifiedCount);
    const totalChars = verifiedStr.length;
    const charDelay = (config.duration * 1000) / totalChars;

    // Style 1: Character reveal animation
    if (config.animationStyle === 'style-1') {
      let currentChar = 0;
      const interval = setInterval(() => {
        currentChar++;
        setVisibleChars(currentChar);

        // Fire confetti when complete (if enabled)
        if (currentChar >= totalChars && !confettiFiredRef.current && confettiInstanceRef.current && config.showConfetti) {
          confettiFiredRef.current = true;
          fireConfetti();
        }

        if (currentChar >= totalChars) {
          clearInterval(interval);
        }
      }, charDelay);

      return () => {
        clearInterval(interval);
      };
    } else {
      // For other styles, show full text immediately and fire confetti
      setVisibleChars(totalChars);
      if (config.showConfetti && confettiInstanceRef.current) {
        setTimeout(() => {
          if (!confettiFiredRef.current) {
            confettiFiredRef.current = true;
            fireConfetti();
          }
        }, config.duration * 1000);
      }
    }
  }, [config.verifiedCount, config.totalCount, config.duration, config.showConfetti, config.animationStyle]);

  const fireConfetti = () => {
    if (!confettiInstanceRef.current) return;
    fireConfettiShared(confettiInstanceRef.current, previewConfettiBurstConfig);
  };

  // Calculate responsive font sizes based on width
  // Reduced to better fit preview while maintaining readability
  const baseWidth = 1920;
  const scaleFactor = config.export.width / baseWidth;
  const verifiedFontSize = Math.max(36, 72 * scaleFactor); // Reduced by 0.9x
  const totalFontSize = Math.max(23, 48 * scaleFactor); // Reduced by 0.9x
  const titleFontSize = Math.max(16, 25 * scaleFactor); // Reduced by 0.9x

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl shadow-2xl border-2"
        style={{
          backgroundColor: config.colors.background,
          borderColor: config.colors.border,
          aspectRatio: `${config.export.width} / ${config.export.height}`,
        }}
      >
        {/* Content Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          {/* Title with Icon */}
          <div className="flex items-center gap-3 mb-8">
            <h2
              className="font-medium"
              style={{
                fontSize: `${titleFontSize}px`,
                color: config.colors.title,
                fontFamily: 'TwitterChirp, -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}
            >
              Verified followers
            </h2>
            <div
              key={`icon-${animationKey}`}
              className={`flex items-center justify-center ${config.animationStyle === 'style-2' ? 'bounce-scale-animate' : ''}`}
              style={{
                color: config.colors.verifiedIcon,
                width: `${titleFontSize * 1.2}px`,
                height: `${titleFontSize * 1.2}px`,
              }}
            >
              <svg viewBox="0 0 22 22" fill="currentColor" className="w-full h-full">
                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
              </svg>
            </div>
          </div>

          {/* Numbers */}
          <div className="flex items-baseline gap-2 mb-4">
            {/* Verified Count - Different animations based on style */}
            <span
              key={`verified-${animationKey}`}
              className={`font-bold ${config.animationStyle === 'style-2' ? 'bounce-scale-animate' : ''}`}
              style={{
                fontSize: `${verifiedFontSize}px`,
                color: config.colors.numbers,
                fontFamily: 'TwitterChirp, -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                display: 'inline-block',
              }}
            >
              {config.animationStyle === 'style-1' ? (
                <>
                  {formatCount(config.verifiedCount).substring(0, visibleChars)}
                  <span style={{ opacity: 0 }}>
                    {formatCount(config.verifiedCount).substring(visibleChars)}
                  </span>
                </>
              ) : (
                formatCount(config.verifiedCount)
              )}
            </span>

            {/* Separator */}
            <span
              className="opacity-50 font-bold"
              style={{
                fontSize: `${totalFontSize}px`,
                color: config.colors.numbers,
                fontFamily: 'TwitterChirp, -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
              }}
            >
              {' / '}
            </span>

            {/* Total Count - Scale and fade in */}
            <span
              key={`total-${animationKey}`}
              className="font-bold total-count-animate"
              style={{
                fontSize: `${totalFontSize}px`,
                color: config.colors.numbers,
                fontFamily: 'TwitterChirp, -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                display: 'inline-block',
              }}
            >
              {formatCount(config.totalCount)}
            </span>
          </div>

          {/* CSS Animations */}
          <style jsx>{`
            .total-count-animate {
              animation: fadeIn 1s ease-out forwards;
              opacity: 0;
            }
            @keyframes fadeIn {
              to {
                opacity: 1;
              }
            }

            /* Style 2 - Bounce scale animation with multiple bumps */
            @keyframes bounceScale {
              0% {
                opacity: 0;
                transform: scale(0);
              }
              15% {
                opacity: 1;
                transform: scale(1.2);
              }
              25% {
                transform: scale(0.9);
              }
              35% {
                transform: scale(1.15);
              }
              45% {
                transform: scale(0.95);
              }
              55% {
                transform: scale(1.08);
              }
              65% {
                transform: scale(0.98);
              }
              75% {
                transform: scale(1.02);
              }
              100% {
                opacity: 1;
                transform: scale(1);
              }
            }

            .bounce-scale-animate {
              animation: bounceScale 1.2s ease-out forwards !important;
              transform-origin: center;
            }

            /* Style 2 - Threads stacking animation */
            .threads-stack-container {
              position: absolute;
              inset: 0;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
              gap: 1px;
            }

            .thread-line-base {
              width: 100%;
              height: 2px;
              background: ${config.colors.verifiedIcon};
              opacity: 0;
              animation: threadAppear 0.05s ease-out forwards;
            }

            .thread-mask-container {
              position: absolute;
              inset: 0;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .thread-highlight-wrapper {
              position: relative;
              display: inline-block;
            }

            .thread-text-content {
              position: relative;
              z-index: 10;
              opacity: 0.3;
            }

            .thread-highlight-lines {
              position: absolute;
              inset: 0;
              display: flex;
              flex-direction: column;
              justify-content: flex-end;
              gap: 1px;
              mix-blend-mode: lighten;
            }

            .thread-line-highlight {
              width: 200%;
              height: 2px;
              margin-left: -50%;
              opacity: 0;
              animation: threadHighlight 0.05s ease-out forwards;
            }

            @keyframes threadAppear {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 0.15;
              }
            }

            @keyframes threadHighlight {
              0% {
                opacity: 0;
              }
              100% {
                opacity: 1;
              }
            }
          `}</style>

        </div>

        {/* Subtle grid pattern (optional) */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    </div>
  );
}
