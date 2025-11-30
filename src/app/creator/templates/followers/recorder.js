export const calculateCounterValue = (start, end, progress) => {
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
};

/**
 * Draw follower count frame on canvas
 * Handles all canvas rendering for this template
 */
export function drawFrame({
    ctx,
    config,
    content,
    animationState,
    VIDEO_WIDTH,
    VIDEO_HEIGHT,
    fontFamily,
    overlayImage
}) {
    const textStyle = config.style.text;
    const bgStyle = config.style.background;
    const fontSize = VIDEO_HEIGHT * 0.15;
    const labelFontSize = fontSize / 2;

    // Helper to create gradient
    const createGradient = (direction) => {
        const dirMap = {
            'to right': [0, 0, VIDEO_WIDTH, 0],
            'to left': [VIDEO_WIDTH, 0, 0, 0],
            'to bottom': [0, 0, 0, VIDEO_HEIGHT],
            'to top': [0, VIDEO_HEIGHT, 0, 0],
            'to bottom right': [0, 0, VIDEO_WIDTH, VIDEO_HEIGHT],
            'to bottom left': [VIDEO_WIDTH, 0, 0, VIDEO_HEIGHT],
            'to top right': [0, VIDEO_HEIGHT, VIDEO_WIDTH, 0],
            'to top left': [VIDEO_WIDTH, VIDEO_HEIGHT, 0, 0],
        };
        const coords = dirMap[direction] || dirMap['to right'];
        return ctx.createLinearGradient(...coords);
    };

    // 1. Draw Background
    if (bgStyle.type === 'gradient') {
        const gradient = createGradient(bgStyle.direction);
        gradient.addColorStop(0, bgStyle.color1);
        gradient.addColorStop(1, bgStyle.color2);
        ctx.fillStyle = gradient;
    } else {
        ctx.fillStyle = bgStyle.color1;
    }
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

    // 2. Draw Label (if exists) with animation
    const hasLabel = config.self.label;
    const labelPosition = config.self.labelPosition || 'above';

    // Calculate Y positions based on label position
    let counterY, labelY;
    if (hasLabel) {
        if (labelPosition === 'below') {
            counterY = VIDEO_HEIGHT * 0.45; // Counter higher
            labelY = VIDEO_HEIGHT * 0.58;   // Label lower
        } else {
            counterY = VIDEO_HEIGHT * 0.55; // Counter lower
            labelY = VIDEO_HEIGHT * 0.42;   // Label higher
        }
    } else {
        counterY = VIDEO_HEIGHT * 0.5; // Center when no label
    }

    if (hasLabel) {
        ctx.save();

        // Apply label animation
        if (animationState && animationState.progress !== undefined) {
            const labelCenterX = VIDEO_WIDTH / 2;
            const labelCenterY = labelY;
            ctx.translate(labelCenterX, labelCenterY);

            // Label scales from 2.0 to 1.0 quickly
            const labelScale = 2.0 - (1.0 * Math.min(animationState.progress * 2, 1));
            ctx.scale(labelScale, labelScale);

            // Label fades in from 0 to 1 (same timing as scale)
            const labelOpacity = Math.min(animationState.progress * 2, 1);
            ctx.globalAlpha = labelOpacity;

            ctx.translate(-labelCenterX, -labelCenterY);
        }

        ctx.font = `600 ${labelFontSize}px "${fontFamily}", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        if (textStyle.type === 'gradient') {
            const labelGradient = createGradient(textStyle.direction);
            labelGradient.addColorStop(0, textStyle.color1);
            labelGradient.addColorStop(1, textStyle.color2);
            ctx.fillStyle = labelGradient;
        } else {
            ctx.fillStyle = textStyle.color1;
        }

        ctx.fillText(config.self.label, VIDEO_WIDTH / 2, labelY);
        ctx.restore();
    }

    // 3. Draw Counter with animation
    ctx.save();

    if (animationState && animationState.scale) {
        const centerX = VIDEO_WIDTH / 2;
        const centerY = counterY;
        ctx.translate(centerX, centerY);
        ctx.scale(animationState.scale, animationState.scale);
        if (animationState.opacity !== undefined) {
            ctx.globalAlpha = animationState.opacity;
        }
        ctx.translate(-centerX, -centerY);
    }

    ctx.font = `900 ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (textStyle.type === 'gradient') {
        const textGradient = createGradient(textStyle.direction);
        textGradient.addColorStop(0, textStyle.color1);
        textGradient.addColorStop(1, textStyle.color2);
        ctx.fillStyle = textGradient;
    } else {
        ctx.fillStyle = textStyle.color1;
    }

    // Format and draw the number
    const displayText = typeof content === 'number' ? content.toLocaleString() : content;
    ctx.fillText(displayText, VIDEO_WIDTH / 2, counterY);

    ctx.restore();

    // 4. Draw overlay image with dynamic positioning (if exists) with animation
    if (overlayImage) {
        ctx.save();

        const imageSize = VIDEO_HEIGHT * 0.08; // 8% of video height (matches label text size)
        const imagePadding = VIDEO_HEIGHT * 0.04; // 4% padding from edges

        // Calculate position based on config
        const getImagePosition = (position) => {
            const positions = {
                'top-left': {
                    x: imagePadding,
                    y: imagePadding
                },
                'top-center': {
                    x: VIDEO_WIDTH / 2 - imageSize / 2,
                    y: imagePadding
                },
                'top-right': {
                    x: VIDEO_WIDTH - imagePadding - imageSize,
                    y: imagePadding
                },
                'bottom-left': {
                    x: imagePadding,
                    y: VIDEO_HEIGHT - imagePadding - imageSize
                },
                'bottom-center': {
                    x: VIDEO_WIDTH / 2 - imageSize / 2,
                    y: VIDEO_HEIGHT - imagePadding - imageSize
                },
                'bottom-right': {
                    x: VIDEO_WIDTH - imagePadding - imageSize,
                    y: VIDEO_HEIGHT - imagePadding - imageSize
                }
            };
            return positions[position] || positions['top-left'];
        };

        const position = config.image?.position || 'top-left';
        const imagePos = getImagePosition(position);
        const imageX = imagePos.x + imageSize / 2; // Center point for transform
        const imageY = imagePos.y + imageSize / 2;

        // Apply scale animation (0.8 to 1.0) with fade in
        if (animationState && animationState.progress !== undefined) {
            ctx.translate(imageX, imageY);

            // Image scales from 0.8 to 1.0 smoothly
            const imageScale = 0.8 + (0.2 * Math.min(animationState.progress * 1.5, 1));
            ctx.scale(imageScale, imageScale);

            // Image fades in from 0 to 1
            const imageOpacity = Math.min(animationState.progress * 1.5, 1);
            ctx.globalAlpha = imageOpacity;

            ctx.translate(-imageX, -imageY);
        }

        ctx.drawImage(
            overlayImage,
            imagePos.x,
            imagePos.y,
            imageSize,
            imageSize
        );

        ctx.restore();
    }
}

/**
 * Follower Count video recorder
 * Handles all rendering logic for follower count template
 */
export async function renderFrame({
    canvas,
    ctx,
    config,
    elapsed,
    COUNTER_DURATION,
    VIDEO_WIDTH,
    VIDEO_HEIGHT,
    fontFamily
}) {
    const counterProgress = Math.min(elapsed / COUNTER_DURATION, 1);
    const currentNumber = Math.round(
        calculateCounterValue(
            config.self.start,
            config.self.end,
            counterProgress
        )
    );

    // Prepare animation state - always visible with subtle scale
    const easedProgress = counterProgress < 1 ? (1 - Math.pow(1 - counterProgress, 2)) : 1;

    // Scale from 0.8 to 1.0 during counting (always visible)
    const scale = 0.8 + (0.2 * easedProgress);

    const animationState = {
        animation: 'custom',
        scale: scale,
        opacity: 1,  // Always visible
        progress: easedProgress,
        isEntering: true
    };

    return {
        content: currentNumber,
        animationState,
        shouldTriggerConfetti: counterProgress >= 1
    };
}

/**
 * Calculate total duration for follower count template
 */
export function calculateDuration(config, CONFETTI_DURATION) {
    const COUNTER_DURATION = (config.self.duration || 2) * 1000;
    return {
        COUNTER_DURATION,
        totalDuration: COUNTER_DURATION,
        videoDuration: COUNTER_DURATION + CONFETTI_DURATION
    };
}
