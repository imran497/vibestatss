'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  useEffect(() => {
    // Reset animation when config changes
    setCurrentSlideIndex(0);
    setAnimationKey(prev => prev + 1);
  }, [config]);

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

  // Use slide background (initialized with global by default)
  const activeBgColors = currentSlide.bgColors || config.bgColors;
  const activeBgIsGradient = currentSlide.bgIsGradient !== undefined ? currentSlide.bgIsGradient : config.bgIsGradient;

  const bgStyle = activeBgIsGradient
    ? {
        background: `linear-gradient(135deg, ${activeBgColors[0]} 0%, ${activeBgColors[1]} 100%)`,
      }
    : {
        backgroundColor: activeBgColors[0],
      };

  const textStyle = currentSlide.isGradient
    ? {
        backgroundImage: `linear-gradient(135deg, ${currentSlide.textColors[0]} 0%, ${currentSlide.textColors[1]} 100%)`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }
    : {
        color: currentSlide.textColors[0],
      };

  const animation = animationVariants[currentSlide.animation] || animationVariants.fade;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl"
        style={{
          ...bgStyle,
          aspectRatio: `${config.export.width} / ${config.export.height}`,
        }}
      >
        {/* Content Container */}
        <div className="absolute inset-0 flex items-center justify-center px-16 py-8">
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
                        width: `${currentSlide.emojiSize || 60}px`,
                        height: `${currentSlide.emojiSize || 60}px`,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: `${currentSlide.emojiSize || 60}px` }}>
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
                  fontSize: `${currentSlide.fontSize || 60}px`,
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
                        width: `${currentSlide.emojiSize || 60}px`,
                        height: `${currentSlide.emojiSize || 60}px`,
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: `${currentSlide.emojiSize || 60}px` }}>
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
                    ? 'w-8 bg-white'
                    : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
