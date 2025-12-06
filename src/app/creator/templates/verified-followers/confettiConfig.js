/**
 * Shared confetti configuration for verified-followers template
 * Separate configs for preview (VideoBox) and export (video-recorder)
 */

/**
 * Format large numbers with k/M suffix
 * @param {number} num - The number to format
 * @returns {string} Formatted number (e.g., 1.2k, 10k, 1M)
 */
export function formatCount(num) {
  if (num >= 1000000) {
    const millions = num / 1000000;
    return millions % 1 === 0 ? `${millions}M` : `${millions.toFixed(1)}M`;
  } else if (num > 1000) {
    const thousands = num / 1000;
    return thousands % 1 === 0 ? `${thousands}k` : `${thousands.toFixed(1)}k`;
  }
  return num.toLocaleString();
}

export const confettiColors = [
  '#1d9bf0', // Twitter blue (verified icon)
  '#ffffff', // White (numbers are light)
  '#7dd3fc', // Light blue
  '#38bdf8', // Sky blue
];

// Config for preview (VideoBox)
export const previewConfettiBurstConfig = {
  particleCount: 100,
  spread: 70,
  ticks: 500,
  gravity: 1,
  scalar: 0.8,
  drift: 0,
  decay: 0.9, // Minimal fading
};

// Config for export (video-recorder) - larger particles for better visibility
export const exportConfettiBurstConfig = {
  particleCount: 150,
  spread: 90,
  ticks: 500,
  gravity: 0.9,
  scalar: 2.2, // Larger particles for export
  drift: 0,
  decay: 0.96, // Minimal fading
  startVelocity: 40, // Increased initial fire speed
};

export const confettiBursts = [
  {
    angle: 60,
    origin: { x: 0, y: 1 }, // Bottom left corner
  },
  {
    angle: 120,
    origin: { x: 1, y: 1 }, // Bottom right corner
  },
];

/**
 * Fire confetti using the provided confetti instance
 * Fires 3 times with 1 second gaps
 * @param {Function} confettiInstance - The confetti function from canvas-confetti
 * @param {Object} burstConfig - The burst configuration to use (preview or export)
 */
export function fireConfetti(confettiInstance, burstConfig) {
  const fireBurst = () => {
    confettiBursts.forEach(burst => {
      confettiInstance({
        ...burstConfig,
        ...burst,
        colors: confettiColors,
      });
    });
  };

  // Fire immediately
  fireBurst();

  // Fire after 1 second
  setTimeout(fireBurst, 200);
  setTimeout(fireBurst, 400);
  setTimeout(fireBurst, 1000);
}
