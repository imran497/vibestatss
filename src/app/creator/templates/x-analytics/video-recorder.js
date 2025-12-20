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

/**
 * Video recorder for X Analytics template
 */
export async function recordVideo(config) {
  console.log('🎬 Initializing X Analytics video recorder...');

  // Fixed card dimensions matching desktop preview
  const CARD_WIDTH = 209.5;
  const CARD_HEIGHT = 96.5;
  const PADDING = 64;
  const BOTTOM_PADDING = 20; // Minimal bottom space
  const CARD_GAP = 12;
  const NUM_ROWS = 4; // Changed from 3 to 4 rows (8 cards total)

  // Calculate video dimensions based on card size (rounded to even numbers for codec compatibility)
  const rawWidth = (CARD_WIDTH * 2) + (PADDING * 2) + CARD_GAP;
  const rawHeight = PADDING + (CARD_HEIGHT * NUM_ROWS) + (CARD_GAP * (NUM_ROWS - 1)) + BOTTOM_PADDING;

  // Round to nearest even number (codecs require even dimensions)
  const VIDEO_WIDTH = Math.round(rawWidth / 2) * 2; // 560px (even)
  const VIDEO_HEIGHT = Math.round(rawHeight / 2) * 2; // 506px (even)

  const FRAME_RATE = config.export?.fps || 60;
  const VIDEO_DURATION = (config.duration || 10) * 1000; // Total video length
  const ANIMATION_DURATION = (config.animationDuration || 2) * 1000; // Counter animation length
  const CONFETTI_DURATION = config.showConfetti ? 3000 : 0;
  const TOTAL_FRAMES = Math.floor(((VIDEO_DURATION + CONFETTI_DURATION) / 1000) * FRAME_RATE);

  // Check for MP4 support
  if (!('VideoEncoder' in window)) {
    throw new Error('MP4_NOT_SUPPORTED');
  }

  const mp4MuxerModule = await import('mp4-muxer');
  const Mp4Muxer = mp4MuxerModule.Muxer;
  const ArrayBufferTarget = mp4MuxerModule.ArrayBufferTarget;

  const target = new ArrayBufferTarget();
  const muxer = new Mp4Muxer({
    target,
    video: {
      codec: 'avc',
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
    },
    fastStart: 'in-memory',
  });

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error('VideoEncoder error:', e),
  });

  // Try different H.264 codec profiles
  const codecCandidates = [
    'avc1.42001E',
    'avc1.42E01E',
    'avc1.4D401E',
    'avc1.640028',
  ];

  let codecConfig = null;
  for (const codec of codecCandidates) {
    const testConfig = {
      codec,
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      bitrate: 5_000_000,
      framerate: FRAME_RATE,
      hardwareAcceleration: 'no-preference'
    };

    const support = await VideoEncoder.isConfigSupported(testConfig);
    console.log(`Checking codec ${codec}:`, support.supported ? '✓ supported' : '✗ not supported');

    if (support.supported) {
      codecConfig = testConfig;
      break;
    }
  }

  if (!codecConfig) {
    console.error('❌ No H.264 codec supported');
    throw new Error('MP4_NOT_SUPPORTED');
  }

  console.log('✓ Using codec:', codecConfig.codec);
  videoEncoder.configure(codecConfig);

  // Load noise texture for background
  const noiseTexture = new Image();
  noiseTexture.crossOrigin = 'anonymous';
  noiseTexture.src = 'https://grainy-gradients.vercel.app/noise.svg';
  await new Promise((resolve) => {
    noiseTexture.onload = resolve;
    noiseTexture.onerror = () => {
      console.warn('Noise texture loading failed, continuing without texture');
      resolve();
    };
  });
  console.log('✓ Noise texture loaded');

  // Setup canvas
  const canvas = document.createElement('canvas');
  canvas.width = VIDEO_WIDTH;
  canvas.height = VIDEO_HEIGHT;
  const ctx = canvas.getContext('2d', {
    alpha: false,
    willReadFrequently: false
  });

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Setup confetti canvas
  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.width = VIDEO_WIDTH;
  confettiCanvas.height = VIDEO_HEIGHT;

  const myConfetti = confetti.create(confettiCanvas, {
    resize: false,
    useWorker: false,
  });

  let confettiFired = false;

  // Card data
  const cards = [
    { label: 'Verified Followers', value: config.verifiedFollowers, totalValue: config.totalFollowers, isVerified: true },
    { label: 'Impressions', value: config.impressions },
    { label: 'Engagements', value: config.engagements },
    { label: 'Likes', value: config.likes },
    { label: 'Replies', value: config.replies },
    { label: 'Profile Visits', value: config.profileVisits },
    { label: 'New Followers', value: config.newFollowers },
    { label: 'Unfollows', value: config.unfollows },
  ];

  console.log(`🎬 Recording ${TOTAL_FRAMES} frames at ${FRAME_RATE}fps...`);

  // Draw each frame
  for (let frameIndex = 0; frameIndex < TOTAL_FRAMES; frameIndex++) {
    const timestamp = (frameIndex / FRAME_RATE) * 1_000_000;
    const currentTime = (frameIndex / FRAME_RATE) * 1000;

    // Clear canvas with background
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

    // Draw texture overlays
    ctx.save();

    // Radial gradient overlay (subtle center glow)
    const radialGradient = ctx.createRadialGradient(
      VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2, 0,
      VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2, Math.max(VIDEO_WIDTH, VIDEO_HEIGHT) / 1.5
    );
    radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    radialGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    radialGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

    // Noise texture overlay (matches preview: opacity-20 brightness-100 contrast-150)
    if (noiseTexture && noiseTexture.complete) {
      ctx.globalAlpha = 0.2;
      ctx.filter = 'brightness(1.0) contrast(1.5)';
      const pattern = ctx.createPattern(noiseTexture, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
      }
      ctx.filter = 'none';
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();

    // Draw confetti layer
    if (config.showConfetti) {
      ctx.drawImage(confettiCanvas, 0, 0);

      // Fire confetti at the end of animation (not video duration)
      // Last card starts at index 7 * 150ms = 1050ms, animation takes 2000ms
      const lastCardDelay = 7 * 150; // 1050ms
      const confettiTime = lastCardDelay + ANIMATION_DURATION; // ~3050ms

      if (currentTime >= confettiTime && !confettiFired) {
        myConfetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: config.confettiColors
        });
        confettiFired = true;
      }
    }

    // Cards start from top padding
    const gridTop = PADDING;

    // Card padding (matching preview)
    const cardPaddingTop = 16;
    const cardPaddingRight = 4;
    const cardPaddingBottom = 8;
    const cardPaddingLeft = 16;

    // Draw cards
    cards.forEach((card, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = PADDING + col * (CARD_WIDTH + CARD_GAP);
      const y = gridTop + row * (CARD_HEIGHT + CARD_GAP);

      ctx.save();
      ctx.translate(x, y);

      // Draw card background with rounded corners
      ctx.fillStyle = config.colors.cardBackground;
      roundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 8);
      ctx.fill();

      // Draw card border
      ctx.strokeStyle = config.colors.cardBorder;
      ctx.lineWidth = 2;
      roundRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, 8);
      ctx.stroke();

      // Draw label (left-aligned at top with padding)
      ctx.fillStyle = config.colors.title;
      ctx.font = `bold 14px TwitterChirp, -apple-system, system-ui, Arial, sans-serif`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const labelWidth = ctx.measureText(card.label).width;
      ctx.fillText(card.label, cardPaddingLeft, cardPaddingTop);

      // Draw verified icon if this is verified followers
      if (card.isVerified) {
        const iconSize = 14;
        const iconX = cardPaddingLeft + labelWidth + 4;
        const iconY = cardPaddingTop;

        ctx.save();
        ctx.translate(iconX, iconY);
        ctx.scale(iconSize / 22, iconSize / 22); // Scale from 22x22 viewBox to iconSize

        // Draw verified checkmark icon
        ctx.fillStyle = 'rgb(29, 155, 240)';
        ctx.beginPath();
        const path = new Path2D('M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z');
        ctx.fill(path);
        ctx.restore();
      }

      // Calculate counter animation for this card's value
      const cardDelay = index * 150; // 150ms delay between cards
      const cardStartTime = cardDelay;
      const cardEndTime = cardStartTime + ANIMATION_DURATION;

      let displayValue = 0;
      let displayTotal = 0;
      if (currentTime < cardStartTime) {
        displayValue = 0;
        displayTotal = 0;
      } else if (currentTime >= cardEndTime) {
        displayValue = card.value;
        displayTotal = card.totalValue || 0;
      } else {
        const progress = (currentTime - cardStartTime) / (cardEndTime - cardStartTime);
        displayValue = Math.round(calculateCounterValue(0, card.value, progress));
        if (card.totalValue) {
          displayTotal = Math.round(calculateCounterValue(0, card.totalValue, progress));
        }
      }

      // Draw value with counter
      if (card.isVerified) {
        // Draw verified count (31px)
        ctx.font = `bold 31px TwitterChirp, -apple-system, system-ui, Arial, sans-serif`;
        ctx.fillStyle = config.colors.text;
        const verifiedText = formatCount(displayValue);
        const verifiedWidth = ctx.measureText(verifiedText).width;
        ctx.fillText(verifiedText, cardPaddingLeft, cardPaddingTop + 35);

        // Draw separator (16px)
        ctx.font = `bold 16px TwitterChirp, -apple-system, system-ui, Arial, sans-serif`;
        ctx.fillStyle = config.colors.title;
        const separatorX = cardPaddingLeft + verifiedWidth;
        ctx.fillText(' / ', separatorX, cardPaddingTop + 35 + 11); // Adjust Y to align baseline

        // Draw total count (16px)
        ctx.fillStyle = config.colors.text;
        const separatorWidth = ctx.measureText(' / ').width;
        const totalX = separatorX + separatorWidth;
        ctx.fillText(formatCount(displayTotal), totalX, cardPaddingTop + 35 + 11); // Adjust Y to align baseline
      } else {
        ctx.font = `bold 31px TwitterChirp, -apple-system, system-ui, Arial, sans-serif`;
        ctx.fillStyle = config.colors.text;
        ctx.fillText(formatCount(displayValue), cardPaddingLeft, cardPaddingTop + 35);
      }

      ctx.restore();
    });

    // Wait for confetti animation to render
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Encode frame
    const videoFrame = new VideoFrame(canvas, {
      timestamp,
      duration: 1_000_000 / FRAME_RATE,
    });
    videoEncoder.encode(videoFrame, { keyFrame: frameIndex % 150 === 0 });
    videoFrame.close();

    // Progress logging
    if (frameIndex % 30 === 0 || frameIndex === TOTAL_FRAMES - 1) {
      const progress = ((frameIndex + 1) / TOTAL_FRAMES * 100).toFixed(1);
      console.log(`  Progress: ${progress}% (frame ${frameIndex + 1}/${TOTAL_FRAMES})`);
    }
  }

  // Finalize encoding
  await videoEncoder.flush();
  muxer.finalize();

  const buffer = target.buffer;
  console.log(`✅ Video encoded: ${buffer.byteLength} bytes`);

  return new Blob([buffer], { type: 'video/mp4' });
}

// Helper function to draw rounded rectangles
function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
