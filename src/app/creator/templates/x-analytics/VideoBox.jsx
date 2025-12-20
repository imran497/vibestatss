'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import confetti from 'canvas-confetti';

function formatCount(num) {
  if (num >= 1000000) {
    const millions = num / 1000000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  } else if (num > 1000) {
    const thousands = num / 1000;
    return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(1)}k`;
  }
  return num.toLocaleString();
}

// Counter animation with two-phase easing
function calculateCounterValue(start, end, progress) {
  const split = 0.65; // 65% time for first 90%
  let p;

  if (progress < split) {
    // First phase: Linear fast
    p = (progress / split) * 0.90;
  } else {
    // Second phase: Slow ease out
    const t = (progress - split) / (1 - split);
    const easeOut = 1 - Math.pow(1 - t, 3); // Cubic ease out
    p = 0.90 + easeOut * 0.10;
  }

  return start + (end - start) * p;
}

// Animated counter component
function AnimatedCounter({ value, delay, duration }) {
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => formatCount(Math.round(latest)));

  useEffect(() => {
    count.set(0); // Reset to 0 when value changes
    const timer = setTimeout(() => {
      const controls = animate(0, 1, {
        duration: duration,
        ease: "linear",
        onUpdate: (latest) => {
          count.set(calculateCounterValue(0, value, latest));
        }
      });
      return () => controls.stop();
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [value, delay, duration, count]);

  return <motion.span>{display}</motion.span>;
}

export default function VideoBox({ config }) {
  const [animationKey, setAnimationKey] = useState(0);
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
      canvas.style.zIndex = '10';
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
    confettiFiredRef.current = false;

    // Fire confetti at end of animation if enabled
    if (config.showConfetti && confettiInstanceRef.current) {
      // Fire after animation completes + stagger delay for last card
      const lastCardDelay = 7 * 0.15; // 8 cards, last one at index 7
      const confettiDelay = (config.animationDuration + lastCardDelay) * 1000;

      setTimeout(() => {
        if (!confettiFiredRef.current) {
          confettiFiredRef.current = true;
          confettiInstanceRef.current({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: config.confettiColors
          });
        }
      }, confettiDelay);
    }
  }, [config]);

  const cards = [
    {
      label: 'Verified Followers',
      value: config.verifiedFollowers,
      totalValue: config.totalFollowers,
      isVerified: true,
    },
    {
      label: 'Impressions',
      value: config.impressions,
    },
    {
      label: 'Engagements',
      value: config.engagements,
    },
    {
      label: 'Likes',
      value: config.likes,
    },
    {
      label: 'Replies',
      value: config.replies,
    },
    {
      label: 'Profile Visits',
      value: config.profileVisits,
    },
    {
      label: 'New Followers',
      value: config.newFollowers,
    },
    {
      label: 'Unfollows',
      value: config.unfollows,
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          backgroundColor: config.colors.background,
          aspectRatio: `${config.export.width} / ${config.export.height}`,
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

        {/* Content Container */}
        <div className="absolute inset-0 p-8 flex flex-col gap-4">
          {/* Cards Grid - 2 per row, horizontal cards */}
          <div className="grid grid-cols-2 gap-3 flex-1">
            {cards.map((card, index) => (
              <div
                key={`card-${index}`}
                className="rounded-xl border-2 flex flex-col justify-center"
                style={{
                  backgroundColor: config.colors.cardBackground,
                  borderColor: config.colors.cardBorder,
                  paddingTop: '16px',
                  paddingRight: '4px',
                  paddingBottom: '8px',
                  paddingLeft: '16px',
                  fontFamily: 'TwitterChirp, -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                }}
              >
                <div
                  className="text-sm font-bold mb-1 flex items-center gap-1"
                  style={{ color: config.colors.title }}
                >
                  {card.label}
                  {card.isVerified && (
                    <svg
                      viewBox="0 0 22 22"
                      aria-label="Verified account"
                      role="img"
                      className="inline-block"
                      style={{ width: '14px', height: '14px' }}
                    >
                      <g>
                        <path
                          d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                          fill="rgb(29, 155, 240)"
                        ></path>
                      </g>
                    </svg>
                  )}
                </div>
                <div
                  key={`value-${index}-${animationKey}`}
                  className="font-bold"
                  style={{
                    color: config.colors.text,
                    fontSize: '31px',
                  }}
                >
                  {card.isVerified ? (
                    <>
                      <AnimatedCounter
                        value={card.value}
                        delay={index * 0.15}
                        duration={config.animationDuration}
                      />
                      <span style={{ color: config.colors.title, fontSize: '16px' }}> / </span>
                      <span style={{ fontSize: '16px' }}>
                        <AnimatedCounter
                          value={card.totalValue}
                          delay={index * 0.15}
                          duration={config.animationDuration}
                        />
                      </span>
                    </>
                  ) : (
                    <AnimatedCounter
                      value={card.value}
                      delay={index * 0.15}
                      duration={config.animationDuration}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
