import confetti from 'canvas-confetti';
import { fireConfetti as fireConfettiShared, exportConfettiBurstConfig, formatCount } from './confettiConfig';

/**
 * Simple video recorder for verified-followers template
 * Captures the character-by-character animation and encodes to MP4
 */
export async function recordVideo(config) {
  console.log('🎬 Initializing verified-followers video recorder...');

  const VIDEO_WIDTH = config.export?.width || 1920;
  const VIDEO_HEIGHT = config.export?.height || 1080;
  const FRAME_RATE = config.export?.fps || 60;
  const DURATION = (config.duration || 2) * 1000; // Convert to ms
  const CONFETTI_DURATION = 8000; // 8 seconds of confetti (total 10 seconds)
  const TOTAL_FRAMES = Math.floor(((DURATION + CONFETTI_DURATION) / 1000) * FRAME_RATE);

  // Wait for TwitterChirp font to load
  try {
    await document.fonts.load('700 96px TwitterChirp');
    console.log('✓ TwitterChirp font loaded');
  } catch (err) {
    console.warn('Font loading failed, continuing anyway:', err);
  }

  // Setup main canvas
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

  // Calculate responsive font sizes (increased for better visibility)
  const baseWidth = 1920;
  const scaleFactor = VIDEO_WIDTH / baseWidth;
  const verifiedFontSize = Math.max(100, 200 * scaleFactor);
  const totalFontSize = Math.max(60, 120 * scaleFactor);
  const titleFontSize = Math.max(40, 62 * scaleFactor);

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

  // Try different H.264 codec profiles in order of preference
  const codecCandidates = [
    'avc1.42001E', // Baseline Profile, Level 3.0
    'avc1.42E01E', // High Profile, Level 3.0
    'avc1.4D401E', // Main Profile, Level 3.0
    'avc1.640028', // High Profile, Level 4.0
  ];

  let codecConfig = null;
  for (const codec of codecCandidates) {
    const config = {
      codec,
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      bitrate: 5_000_000,
      framerate: FRAME_RATE,
      hardwareAcceleration: 'no-preference'
    };

    const support = await VideoEncoder.isConfigSupported(config);
    console.log(`Checking codec ${codec}:`, support.supported ? '✓ supported' : '✗ not supported');

    if (support.supported) {
      codecConfig = config;
      break;
    }
  }

  if (!codecConfig) {
    console.error('❌ No H.264 codec supported');
    throw new Error('MP4_NOT_SUPPORTED');
  }

  console.log('✓ Using codec:', codecConfig.codec);
  videoEncoder.configure(codecConfig);

  console.log(`🎬 Recording ${TOTAL_FRAMES} frames at ${FRAME_RATE}fps...`);

  const verifiedStr = formatCount(config.verifiedCount);
  const totalStr = formatCount(config.totalCount);
  const charDelay = DURATION / verifiedStr.length;

  // Draw each frame
  for (let frameIndex = 0; frameIndex < TOTAL_FRAMES; frameIndex++) {
    const timestamp = (frameIndex / FRAME_RATE) * 1_000_000; // microseconds
    const currentTime = (frameIndex / FRAME_RATE) * 1000; // milliseconds

    // Calculate how many characters should be visible
    const visibleChars = Math.min(
      Math.floor(currentTime / charDelay),
      verifiedStr.length
    );

    // Fire confetti when verified count is complete (if enabled)
    if (visibleChars >= verifiedStr.length && !confettiFired && config.showConfetti) {
      fireConfettiShared(myConfetti, exportConfettiBurstConfig);
      confettiFired = true;
    }

    // Clear canvas with background color
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

    // Draw confetti layer behind everything
    ctx.drawImage(confettiCanvas, 0, 0);

    // Draw subtle grid pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 50 * scaleFactor;
    for (let x = 0; x < VIDEO_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, VIDEO_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < VIDEO_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(VIDEO_WIDTH, y);
      ctx.stroke();
    }

    // Calculate center position
    const centerX = VIDEO_WIDTH / 2;
    const centerY = VIDEO_HEIGHT / 2;

    // Draw title and icon (moved up more)
    const titleY = centerY - verifiedFontSize * 1.0;

    // Measure title text to position icon properly
    ctx.font = `500 ${titleFontSize}px TwitterChirp, -apple-system, system-ui, sans-serif`;
    const titleText = 'Verified followers';
    const titleWidth = ctx.measureText(titleText).width;

    // Draw title text first
    ctx.fillStyle = config.colors.title;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(titleText, centerX, titleY);

    // Draw verified icon (positioned to the RIGHT of the title text, vertically centered)
    const iconSize = titleFontSize * 1.2;
    const gapSize = 12 * scaleFactor; // 12px gap
    const iconX = centerX + titleWidth / 2 + gapSize + iconSize / 2;
    const iconY = titleY; // Align with title center

    // Calculate icon scale for style-2 bounce animation with multiple bumps
    let iconScale = 1;
    let iconOpacity = 1;
    if (config.animationStyle === 'style-2') {
      const animDuration = 1200; // 1.2s in ms
      const progress = Math.min(currentTime / animDuration, 1);

      if (progress <= 0.15) {
        const t = progress / 0.15;
        iconScale = t * 1.2;
        iconOpacity = t;
      } else if (progress <= 0.25) {
        const t = (progress - 0.15) / 0.10;
        iconScale = 1.2 - t * 0.3;
        iconOpacity = 1;
      } else if (progress <= 0.35) {
        const t = (progress - 0.25) / 0.10;
        iconScale = 0.9 + t * 0.25;
      } else if (progress <= 0.45) {
        const t = (progress - 0.35) / 0.10;
        iconScale = 1.15 - t * 0.20;
      } else if (progress <= 0.55) {
        const t = (progress - 0.45) / 0.10;
        iconScale = 0.95 + t * 0.13;
      } else if (progress <= 0.65) {
        const t = (progress - 0.55) / 0.10;
        iconScale = 1.08 - t * 0.10;
      } else if (progress <= 0.75) {
        const t = (progress - 0.65) / 0.10;
        iconScale = 0.98 + t * 0.04;
      } else {
        const t = (progress - 0.75) / 0.25;
        iconScale = 1.02 - t * 0.02;
        iconOpacity = 1;
      }
    }

    ctx.save();
    ctx.globalAlpha = iconOpacity;
    ctx.fillStyle = config.colors.verifiedIcon;
    ctx.translate(iconX, iconY); // Center point for scaling (iconY is already the center)
    ctx.scale(iconScale, iconScale);
    ctx.scale(iconSize / 22, iconSize / 22); // Scale to iconSize (original SVG is 22x22)
    ctx.translate(-11, -11); // Center the SVG (SVG viewBox is 22x22, center is at 11,11)

    // SVG path for Twitter verified badge
    const path = new Path2D('M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z');
    ctx.fill(path);
    ctx.restore();

    // Calculate positions to center the entire group (verified + "/" + total)
    const verifiedY = centerY + verifiedFontSize / 2;

    // Measure all text widths
    ctx.font = `700 ${verifiedFontSize}px TwitterChirp, -apple-system, system-ui, sans-serif`;
    const verifiedWidth = ctx.measureText(verifiedStr).width;

    ctx.font = `700 ${totalFontSize}px TwitterChirp, -apple-system, system-ui, sans-serif`;
    const separatorWidth = ctx.measureText(' / ').width;
    const totalWidth = ctx.measureText(totalStr).width;

    // Calculate total group width and starting position
    const gap = totalFontSize * 0.15; // Small gap between elements
    const totalGroupWidth = verifiedWidth + separatorWidth + totalWidth;
    const groupStartX = centerX - totalGroupWidth / 2;

    // Position each element
    const verifiedX = groupStartX + verifiedWidth; // Right edge of verified count
    const separatorX = groupStartX + verifiedWidth + separatorWidth / 2; // Center of separator
    const totalX = groupStartX + verifiedWidth + separatorWidth; // Left edge of total count

    ctx.font = `700 ${verifiedFontSize}px TwitterChirp, -apple-system, system-ui, sans-serif`;
    ctx.textBaseline = 'bottom';

    if (config.animationStyle === 'style-1') {
      // Style 1: Character by character reveal
      ctx.textAlign = 'right';

      // Draw full text in background color (invisible layer for layout)
      ctx.fillStyle = config.colors.background;
      ctx.fillText(verifiedStr, verifiedX, verifiedY);

      // Draw visible portion in actual color on top
      const visibleText = verifiedStr.substring(0, visibleChars);
      if (visibleText.length > 0) {
        ctx.fillStyle = config.colors.numbers;
        ctx.fillText(visibleText, verifiedX, verifiedY);
      }
    } else if (config.animationStyle === 'style-2') {
      // Style 2: Bounce scale animation with multiple bumps
      const animDuration = 1200; // 1.2s in ms
      const progress = Math.min(currentTime / animDuration, 1);
      let scale = 1;
      let opacity = 1;

      if (progress <= 0.15) {
        const t = progress / 0.15;
        scale = t * 1.2;
        opacity = t;
      } else if (progress <= 0.25) {
        const t = (progress - 0.15) / 0.10;
        scale = 1.2 - t * 0.3;
        opacity = 1;
      } else if (progress <= 0.35) {
        const t = (progress - 0.25) / 0.10;
        scale = 0.9 + t * 0.25;
      } else if (progress <= 0.45) {
        const t = (progress - 0.35) / 0.10;
        scale = 1.15 - t * 0.20;
      } else if (progress <= 0.55) {
        const t = (progress - 0.45) / 0.10;
        scale = 0.95 + t * 0.13;
      } else if (progress <= 0.65) {
        const t = (progress - 0.55) / 0.10;
        scale = 1.08 - t * 0.10;
      } else if (progress <= 0.75) {
        const t = (progress - 0.65) / 0.10;
        scale = 0.98 + t * 0.04;
      } else {
        const t = (progress - 0.75) / 0.25;
        scale = 1.02 - t * 0.02;
      }

      ctx.save();
      ctx.globalAlpha = opacity;

      // Calculate text width and center position
      const textWidth = ctx.measureText(verifiedStr).width;
      const textCenterX = verifiedX - textWidth / 2;

      // Transform: translate to center, scale, then draw
      ctx.translate(textCenterX, verifiedY);
      ctx.scale(scale, scale);

      ctx.fillStyle = config.colors.numbers;
      ctx.textAlign = 'center';
      ctx.fillText(verifiedStr, 0, 0);

      ctx.restore();
    } else {
      // Default: show immediately (right-aligned)
      ctx.fillStyle = config.colors.numbers;
      ctx.textAlign = 'right';
      ctx.fillText(verifiedStr, verifiedX, verifiedY);
    }

    // Draw separator
    ctx.fillStyle = config.colors.numbers;
    ctx.globalAlpha = 0.5;
    ctx.font = `700 ${totalFontSize}px TwitterChirp, -apple-system, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(' / ', separatorX, verifiedY);
    ctx.globalAlpha = 1.0;

    // Draw total count (fade in only, no scale)
    const totalOpacity = Math.min(currentTime / 1000, 1); // Fade in over 1 second

    ctx.save();
    ctx.globalAlpha = totalOpacity;
    ctx.fillStyle = config.colors.numbers;
    ctx.font = `700 ${totalFontSize}px TwitterChirp, -apple-system, system-ui, sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(totalStr, totalX, verifiedY);
    ctx.restore();

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
