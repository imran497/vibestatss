import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { calculateCounterValue } from './recorder';
import { getImageById } from './image-registry';

// Helper to sanitize CSS gradient direction
const getDirection = (dir) => {
  const map = {
    'to r': 'to right',
    'to l': 'to left',
    'to b': 'to bottom',
    'to t': 'to top',
    'to br': 'to bottom right',
    'to bl': 'to bottom left',
    'to tr': 'to top right',
    'to tl': 'to top left',
  };
  return map[dir] || dir || 'to right';
};

export default function VideoBox({ start, end, duration, label, labelPosition, image, style, resetKey, onComplete }) {
  const count = useMotionValue(start);
  const display = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(0, 1, {
      duration: duration,
      ease: "linear",
      onUpdate: (latest) => {
        count.set(calculateCounterValue(start, end, latest));
      },
      onComplete: onComplete
    });
    return controls.stop;
  }, [start, end, duration, resetKey, count, onComplete]);

  const textStyle = style.text.type === 'gradient'
    ? {
      backgroundImage: `linear-gradient(${getDirection(style.text.direction)}, ${style.text.color1}, ${style.text.color2})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      color: 'transparent',
      display: 'inline-block'
    }
    : { color: style.text.color1 };

  // Get image source
  const getImageSrc = () => {
    if (image.category === 'none') return null;
    if (image.category === 'custom') return image.customImageUrl;
    if (image.selectedId) {
      const imageData = getImageById(image.selectedId);
      return imageData?.imagePath;
    }
    return null;
  };

  const imageSrc = getImageSrc();

  // Get position styles - use calc for perfect centering
  const getPositionStyle = () => {
    const padding = '1.5rem'; // 24px (6 * 4px)
    const logoHalfSize = '0.75rem'; // Half of w-6 (24px / 2 = 12px)
    const positionMap = {
      'top-left': { top: padding, left: padding },
      'top-center': { top: padding, left: `calc(50% - ${logoHalfSize})` },
      'top-right': { top: padding, right: padding },
      'bottom-left': { bottom: padding, left: padding },
      'bottom-center': { bottom: padding, left: `calc(50% - ${logoHalfSize})` },
      'bottom-right': { bottom: padding, right: padding }
    };
    return positionMap[image.position] || positionMap['top-left'];
  };

  return (
    <>
      {/* Image with dynamic positioning and animation */}
      {imageSrc && (
        <div
          className="absolute z-10"
          style={getPositionStyle()}
        >
          <motion.div
            key={`image-${resetKey}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <img
              src={imageSrc}
              alt="Selected overlay"
              className="w-6 h-6 object-contain"
            />
          </motion.div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex items-center gap-3 ${labelPosition === 'below' ? 'flex-col-reverse' : 'flex-col'}`}>
        {label && (
          <motion.p
            key={resetKey}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-2xl font-semibold"
            style={textStyle}
          >
            {label}
          </motion.p>
        )}
        <motion.h1
          className="text-6xl font-black"
          style={textStyle}
        >
          {display}
        </motion.h1>
      </div>
    </>
  );
}
