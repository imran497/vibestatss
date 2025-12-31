'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const animationVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
  },
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        bounce: 0.5,
        duration: 0.8,
      },
    },
    exit: { opacity: 0, scale: 0.3 },
  },
  reveal: {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08,
      },
    },
    exit: { opacity: 0 },
  },
};

const wordVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export default function VideoBox({ config }) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);
  const [scaleFactor, setScaleFactor] = useState(1);
  const containerRef = useRef(null);

  useEffect(() => {
    // Reset animation when config changes
    setCurrentSlideIndex(0);
    setAnimationKey(prev => prev + 1);
  }, [config]);

  // Calculate scale factor based on container height (matches export logic)
  useEffect(() => {
    const updateScaleFactor = () => {
      if (containerRef.current) {
        const REFERENCE_HEIGHT = 400; // Same as video-recorder.js
        const actualHeight = containerRef.current.offsetHeight;
        const newScaleFactor = actualHeight / REFERENCE_HEIGHT;
        setScaleFactor(newScaleFactor);
      }
    };

    updateScaleFactor();
    window.addEventListener('resize', updateScaleFactor);
    return () => window.removeEventListener('resize', updateScaleFactor);
  }, [config.export.width, config.export.height]);

  useEffect(() => {
    if (config.textSlides.length === 0) return;

    const currentSlide = config.textSlides[currentSlideIndex];
    const duration = (currentSlide?.duration || 2) * 1000;
    const EXIT_ANIMATION_DURATION = 500; // 0.5s for exit animation

    // Switch slides early to allow exit animation to complete within duration
    const timer = setTimeout(() => {
      setCurrentSlideIndex(prev => (prev + 1) % config.textSlides.length);
    }, duration - EXIT_ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [config.textSlides, currentSlideIndex, animationKey]);

  const currentSlide = config.textSlides[currentSlideIndex];

  if (!currentSlide) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div
          className="relative overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center"
          style={{
            backgroundColor: config.bgColors[0],
            aspectRatio: `${config.export.width} / ${config.export.height}`,
          }}
        >
          <p className="text-white/50 text-sm">Add text slides to preview</p>
        </div>
      </div>
    );
  }

  // Use global background colors
  const bgStyle = config.bgIsGradient
    ? {
        background: `linear-gradient(135deg, ${config.bgColors[0]} 0%, ${config.bgColors[1]} 100%)`,
      }
    : {
        backgroundColor: config.bgColors[0],
      };

  // Use global text colors
  const textStyle = config.textIsGradient
    ? {
        backgroundImage: `linear-gradient(135deg, ${config.textColors[0]} 0%, ${config.textColors[1]} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }
    : {
        color: config.textColors[0],
      };

  const animation = animationVariants[currentSlide.animation] || animationVariants.fade;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          aspectRatio: `${config.export.width} / ${config.export.height}`,
        }}
      >
        {/* Background - Image or Gradient */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden">
          {config.backgroundType === 'image' ? (
            <>
              <Image
                src={`/abstract/${config.backgroundImage}.jpg`}
                alt="Background"
                fill
                className="object-cover rounded-2xl"
                priority
                quality={90}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              <div className="absolute inset-0 bg-white/25 backdrop-blur-md rounded-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/20 rounded-2xl"></div>
            </>
          ) : (
            <div
              className="absolute inset-0 rounded-2xl"
              style={bgStyle}
            />
          )}
        </div>

        {/* White Background Overlay Box */}
        <div className="absolute inset-0 p-5 flex items-center justify-center">
          <div className="bg-white/80 rounded-2xl w-full h-full flex items-center justify-center px-16 py-8 relative">
            {/* Content Container */}
            <div className="w-full h-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentSlideIndex}-${animationKey}`}
                  initial={animation.initial}
                  animate={animation.animate}
                  exit={animation.exit}
                  transition={{ duration: 0.5 }}
                  className="text-center w-full flex flex-col items-center justify-center gap-4"
                >
                  {/* Emoji Top */}
                  {currentSlide.emoji && currentSlide.emojiPosition === 'top' && (
                    <div className="text-center" style={{ lineHeight: 1 }}>
                      {currentSlide.isCustomIcon ? (
                        <img
                          src={currentSlide.emoji}
                          alt="Custom icon"
                          style={{
                            width: `${(currentSlide.emojiSize || 60) * scaleFactor}px`,
                            height: `${(currentSlide.emojiSize || 60) * scaleFactor}px`,
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: `${(currentSlide.emojiSize || 60) * scaleFactor}px` }}>
                          {currentSlide.emoji}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Text */}
                  <h1
                    className="whitespace-pre-line"
                    style={{
                      ...textStyle,
                      fontSize: `${(currentSlide.fontSize || 60) * scaleFactor}px`,
                      fontFamily: currentSlide.fontFamily || 'system-ui, -apple-system, sans-serif',
                      fontWeight: currentSlide.fontWeight || 700,
                      lineHeight: 1.3,
                    }}
                  >
                    {currentSlide.animation === 'reveal' ? (
                      currentSlide.text.split(/(\s+)/).map((word, index) => (
                        word.trim() ? (
                          <motion.span
                            key={index}
                            variants={wordVariants}
                            style={{ display: 'inline-block', marginRight: '0.25em' }}
                          >
                            {word}
                          </motion.span>
                        ) : ' '
                      ))
                    ) : (
                      currentSlide.text
                    )}
                  </h1>

                  {/* Emoji Bottom */}
                  {currentSlide.emoji && currentSlide.emojiPosition === 'bottom' && (
                    <div className="text-center" style={{ lineHeight: 1 }}>
                      {currentSlide.isCustomIcon ? (
                        <img
                          src={currentSlide.emoji}
                          alt="Custom icon"
                          style={{
                            width: `${(currentSlide.emojiSize || 60) * scaleFactor}px`,
                            height: `${(currentSlide.emojiSize || 60) * scaleFactor}px`,
                            objectFit: 'contain',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: `${(currentSlide.emojiSize || 60) * scaleFactor}px` }}>
                          {currentSlide.emoji}
                        </span>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide Indicators */}
            {config.textSlides.length > 1 && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {config.textSlides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentSlideIndex
                        ? 'w-8 bg-gray-800'
                        : 'w-1.5 bg-gray-800/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
