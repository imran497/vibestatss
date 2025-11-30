'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

export default function FollowerCountPreview({ isVisible }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (!isVisible) return;

    let timeoutId;

    const runAnimation = () => {
      // Reset to 0
      count.set(0);

      // Animate to 1000
      const controls = animate(count, 1000, {
        duration: 2,
        ease: "easeOut",
      });

      // Schedule next reset after 10 seconds
      timeoutId = setTimeout(() => {
        runAnimation();
      }, 10000);

      return controls;
    };

    const controls = runAnimation();

    return () => {
      controls.stop();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, count]);

  return (
    <motion.div
      key={count.get()} // Force re-render on reset
      className="text-center"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <motion.div className="text-5xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-1">
        {rounded}
      </motion.div>
      <motion.div
        className="text-sm font-semibold text-gray-400"
        initial={{ scale: 2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Followers
      </motion.div>
    </motion.div>
  );
}
