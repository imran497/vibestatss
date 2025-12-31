/**
 * Video recorder for Daily Update template
 */

// Helper function to convert CSS variable font to actual font name for canvas
function getCanvasFontFamily(fontFamily) {
  if (!fontFamily) return 'sans-serif';

  // Extract font name from CSS variable format: var(--font-name) -> Name
  const fontMap = {
    'var(--font-inter)': 'Inter',
    'var(--font-poppins)': 'Poppins',
    'var(--font-montserrat)': 'Montserrat',
    'var(--font-outfit)': 'Outfit',
    'var(--font-dm-sans)': 'DM Sans',
    'var(--font-work-sans)': 'Work Sans',
    'var(--font-plus-jakarta)': 'Plus Jakarta Sans',
    'var(--font-playfair)': 'Playfair Display',
    'var(--font-merriweather)': 'Merriweather',
    'var(--font-lora)': 'Lora',
    'var(--font-bebas-neue)': 'Bebas Neue',
    'var(--font-oswald)': 'Oswald',
    'var(--font-righteous)': 'Righteous',
    'var(--font-jetbrains-mono)': 'JetBrains Mono',
    'var(--font-space-mono)': 'Space Mono',
  };

  // Check if fontFamily contains a CSS variable
  for (const [cssVar, actualFont] of Object.entries(fontMap)) {
    if (fontFamily.includes(cssVar)) {
      return actualFont;
    }
  }

  // Return as-is if it's already a plain font name
  return fontFamily;
}

export async function recordVideo(config) {
  console.log('🎬 Initializing Daily Update video recorder...');

  // Round dimensions to even numbers (required for H.264 codec)
  const VIDEO_WIDTH = Math.round(config.export.width / 2) * 2;
  const VIDEO_HEIGHT = Math.round(config.export.height / 2) * 2;
  const FRAME_RATE = config.export.fps || 60;
  const ANIMATION_DURATION = 500; // 0.5s for enter/exit animations

  console.log(`📐 Video dimensions: ${VIDEO_WIDTH}x${VIDEO_HEIGHT} (rounded to even)`);

  // Calculate total duration from individual slide durations
  const TOTAL_DURATION = config.textSlides.reduce((total, slide) => {
    return total + ((slide.duration || 2) * 1000);
  }, 0);
  const TOTAL_FRAMES = Math.floor((TOTAL_DURATION / 1000) * FRAME_RATE);

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

  // Try different H.264 codec profiles (same as other templates)
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

  // Preload fonts used in slides
  const fontsToLoad = new Set();
  for (const slide of config.textSlides) {
    if (slide.fontFamily) {
      const fontName = getCanvasFontFamily(slide.fontFamily);
      if (fontName !== 'sans-serif' && fontName !== 'system-ui') {
        fontsToLoad.add(fontName);
      }
    }
  }

  // Load fonts using CSS Font Loading API
  if (fontsToLoad.size > 0) {
    console.log('🔤 Preloading fonts:', Array.from(fontsToLoad).join(', '));
    const fontLoadPromises = Array.from(fontsToLoad).map(fontName => {
      // Load multiple weights to ensure all used weights are available
      return Promise.all([
        document.fonts.load(`400 16px "${fontName}"`),
        document.fonts.load(`700 16px "${fontName}"`),
        document.fonts.load(`800 16px "${fontName}"`),
      ]).catch(err => {
        console.warn(`⚠️ Failed to load font ${fontName}:`, err.message);
      });
    });
    await Promise.all(fontLoadPromises);
    console.log('✓ Fonts loaded');
  }

  // Load background image if needed
  let backgroundImage = null;
  if (config.backgroundType === 'image') {
    backgroundImage = new Image();
    backgroundImage.crossOrigin = 'anonymous';
    backgroundImage.src = `/abstract/${config.backgroundImage}.jpg`;
    await new Promise((resolve) => {
      backgroundImage.onload = resolve;
      backgroundImage.onerror = () => {
        console.warn('Background image loading failed, falling back to gradient');
        resolve();
      };
    });
    console.log('✓ Background image loaded');
  }

  // Preload custom icons
  const customIconImages = {};
  for (const slide of config.textSlides) {
    if (slide.emoji && slide.isCustomIcon) {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = slide.emoji;
      });
      customIconImages[slide.id] = img;
    }
  }

  console.log(`🎬 Recording ${TOTAL_FRAMES} frames at ${FRAME_RATE}fps...`);

  // Animation easing functions
  const easeInOut = (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  const easeOut = (t) => t * (2 - t);

  // Draw each frame
  for (let frameIndex = 0; frameIndex < TOTAL_FRAMES; frameIndex++) {
    const timestamp = (frameIndex / FRAME_RATE) * 1_000_000;
    const currentTime = (frameIndex / FRAME_RATE) * 1000;

    // Determine current slide based on accumulated durations
    let accumulatedTime = 0;
    let slideIndex = 0;
    let slide = config.textSlides[0];
    let slideTime = currentTime;

    for (let i = 0; i < config.textSlides.length; i++) {
      const slideDuration = (config.textSlides[i].duration || 2) * 1000;
      if (currentTime < accumulatedTime + slideDuration) {
        slideIndex = i;
        slide = config.textSlides[i];
        slideTime = currentTime - accumulatedTime;
        break;
      }
      accumulatedTime += slideDuration;
    }

    if (!slide) continue;

    const SLIDE_DURATION = (slide.duration || 2) * 1000;

    // Draw background - Image or Gradient
    if (config.backgroundType === 'image' && backgroundImage && backgroundImage.complete) {
      // Draw background image with blur
      ctx.save();
      ctx.filter = 'blur(8px)';
      ctx.drawImage(backgroundImage, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
      ctx.filter = 'none';
      ctx.restore();

      // White overlay
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);

      // Additional gradient overlay
      const overlayGradient = ctx.createLinearGradient(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
      overlayGradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
      overlayGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
      overlayGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
      ctx.fillStyle = overlayGradient;
      ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    } else {
      // Draw gradient background (use global background)
      if (config.bgIsGradient) {
        const gradient = ctx.createLinearGradient(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
        gradient.addColorStop(0, config.bgColors[0]);
        gradient.addColorStop(1, config.bgColors[1]);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = config.bgColors[0];
      }
      ctx.fillRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    }

    // Draw white overlay box with padding (matches VideoBox.jsx: p-5)
    const boxScale = VIDEO_HEIGHT / 675; // Base scale for 675px height
    const padding = 20 * boxScale; // p-5 = 20px
    const borderRadius = 16 * boxScale; // rounded-2xl = 16px

    // White semi-transparent box
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';

    // Draw rounded rectangle for white box
    const boxX = padding;
    const boxY = padding;
    const boxWidth = VIDEO_WIDTH - (padding * 2);
    const boxHeight = VIDEO_HEIGHT - (padding * 2);

    ctx.beginPath();
    ctx.moveTo(boxX + borderRadius, boxY);
    ctx.lineTo(boxX + boxWidth - borderRadius, boxY);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + borderRadius);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - borderRadius);
    ctx.quadraticCurveTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - borderRadius, boxY + boxHeight);
    ctx.lineTo(boxX + borderRadius, boxY + boxHeight);
    ctx.quadraticCurveTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - borderRadius);
    ctx.lineTo(boxX, boxY + borderRadius);
    ctx.quadraticCurveTo(boxX, boxY, boxX + borderRadius, boxY);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // Calculate animation progress
    let opacity = 1;
    let translateY = 0;
    let scale = 1;
    let revealProgress = 1; // For reveal animation: 0 = no words, 1 = all words

    // Entry animation
    if (slideTime < ANIMATION_DURATION) {
      const progress = slideTime / ANIMATION_DURATION;
      const eased = easeOut(progress);

      switch (slide.animation) {
        case 'fade':
          opacity = eased;
          break;
        case 'slideUp':
          opacity = eased;
          translateY = (1 - eased) * 100;
          break;
        case 'slideDown':
          opacity = eased;
          translateY = -(1 - eased) * 100;
          break;
        case 'zoom':
          opacity = eased;
          scale = 0.5 + (eased * 0.5);
          break;
        case 'bounce':
          opacity = eased;
          // Simple bounce effect
          const bounce = Math.sin(progress * Math.PI * 2) * (1 - progress) * 0.3;
          scale = 0.3 + (eased * 0.7) + bounce;
          break;
        case 'reveal':
          revealProgress = eased;
          break;
      }
    }
    // Exit animation
    else if (slideTime > SLIDE_DURATION - ANIMATION_DURATION) {
      const exitTime = slideTime - (SLIDE_DURATION - ANIMATION_DURATION);
      const progress = exitTime / ANIMATION_DURATION;
      const eased = easeOut(progress);

      switch (slide.animation) {
        case 'fade':
          opacity = 1 - eased;
          break;
        case 'slideUp':
          opacity = 1 - eased;
          translateY = -eased * 100;
          break;
        case 'slideDown':
          opacity = 1 - eased;
          translateY = eased * 100;
          break;
        case 'zoom':
          opacity = 1 - eased;
          scale = 1 - (eased * 0.5);
          break;
        case 'bounce':
          opacity = 1 - eased;
          scale = 1 - (eased * 0.7);
          break;
        case 'reveal':
          opacity = 1 - eased;
          break;
      }
    }

    // Apply transformations
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.translate(VIDEO_WIDTH / 2, VIDEO_HEIGHT / 2 + translateY);
    ctx.scale(scale, scale);

    // Prepare text with per-slide custom font size, family, and weight
    // Scale font size based on video height (reference: 400px preview height)
    // This scales up fonts for the larger export resolution
    const REFERENCE_HEIGHT = 400;
    const scaleFactor = VIDEO_HEIGHT / REFERENCE_HEIGHT;
    const baseFontSize = (slide.fontSize || 60) * scaleFactor;
    const fontFamily = getCanvasFontFamily(slide.fontFamily || 'system-ui, -apple-system, sans-serif');
    const fontWeight = slide.fontWeight || 700;
    ctx.font = `${fontWeight} ${baseFontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Respect newlines in text and wrap long lines
    const maxWidth = VIDEO_WIDTH * 0.85; // Slightly reduced for more padding
    const paragraphs = slide.text.split('\n');
    const lines = [];

    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        lines.push('');
        continue;
      }

      const words = paragraph.split(' ');
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine.length > 0) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
    }

    // Calculate text dimensions
    const lineHeight = baseFontSize * 1.3;
    const totalHeight = lines.length * lineHeight;

    // Calculate max text width for gradient
    let maxTextWidth = 0;
    for (const line of lines) {
      if (line) {
        const metrics = ctx.measureText(line);
        maxTextWidth = Math.max(maxTextWidth, metrics.width);
      }
    }

    // Draw text with gradient or solid color (use global text colors)
    if (config.textIsGradient) {
      // Match preview's 135deg gradient (top-left to bottom-right)
      // Apply gradient relative to text bounds, not full canvas
      const textBoundsSize = Math.sqrt(maxTextWidth * maxTextWidth + totalHeight * totalHeight);
      const textGradient = ctx.createLinearGradient(
        -textBoundsSize / 2,  // Top-left of text bounds
        -textBoundsSize / 2,
        textBoundsSize / 2,   // Bottom-right of text bounds
        textBoundsSize / 2
      );
      textGradient.addColorStop(0, config.textColors[0]);
      textGradient.addColorStop(1, config.textColors[1]);
      ctx.fillStyle = textGradient;
    } else {
      ctx.fillStyle = config.textColors[0];
    }
    const emojiSize = (slide.emojiSize || 60) * scaleFactor;
    const emojiSpacing = 20 * scaleFactor; // Space between emoji and text

    // Calculate vertical offset for emoji
    let contentHeight = totalHeight;
    if (slide.emoji) {
      contentHeight += emojiSize + emojiSpacing;
    }

    // Draw emoji (top position)
    if (slide.emoji && slide.emojiPosition === 'top') {
      ctx.save();
      const emojiY = -contentHeight / 2 + emojiSize / 2;

      if (slide.isCustomIcon && customIconImages[slide.id]) {
        // Draw custom icon as image
        const img = customIconImages[slide.id];
        ctx.drawImage(img, -emojiSize / 2, emojiY - emojiSize / 2, emojiSize, emojiSize);
      } else {
        // Draw emoji as text
        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(slide.emoji, 0, emojiY);
      }
      ctx.restore();
    }

    // Draw lines
    let y = slide.emoji && slide.emojiPosition === 'top'
      ? -contentHeight / 2 + emojiSize + emojiSpacing + lineHeight / 2
      : -totalHeight / 2 + lineHeight / 2;

    // For reveal animation, show words progressively during entry
    if (slide.animation === 'reveal' && slideTime < ANIMATION_DURATION) {
      const allWords = slide.text.split(/\s+/).filter(w => w.trim());
      const totalWords = allWords.length;

      let globalWordIndex = 0;
      for (const line of lines) {
        if (line) {
          const lineWords = line.split(/\s+/);
          const visibleWords = [];

          for (const word of lineWords) {
            const wordProgress = (revealProgress * totalWords) - globalWordIndex;
            if (wordProgress >= 1) {
              // Fully visible word
              visibleWords.push(word);
            } else if (wordProgress > 0) {
              // Currently revealing word with fade-in
              ctx.save();
              const currentText = visibleWords.join(' ') + (visibleWords.length > 0 ? ' ' : '') + word;
              ctx.globalAlpha = opacity * wordProgress;
              ctx.fillText(currentText, 0, y);
              ctx.restore();
            }
            globalWordIndex++;
          }

          // Draw all fully visible words
          if (visibleWords.length > 0) {
            ctx.fillText(visibleWords.join(' '), 0, y);
          }
        }
        y += lineHeight;
      }
    } else {
      // Normal rendering for all other animations
      for (const line of lines) {
        if (line) {
          ctx.fillText(line, 0, y);
        }
        y += lineHeight;
      }
    }

    // Draw emoji (bottom position)
    if (slide.emoji && slide.emojiPosition === 'bottom') {
      ctx.save();
      const emojiY = contentHeight / 2 - emojiSize / 2;

      if (slide.isCustomIcon && customIconImages[slide.id]) {
        // Draw custom icon as image
        const img = customIconImages[slide.id];
        ctx.drawImage(img, -emojiSize / 2, emojiY - emojiSize / 2, emojiSize, emojiSize);
      } else {
        // Draw emoji as text
        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(slide.emoji, 0, emojiY);
      }
      ctx.restore();
    }

    ctx.restore();

    // Draw slide indicators
    if (config.textSlides.length > 1) {
      const indicatorY = VIDEO_HEIGHT - 60;
      const indicatorSpacing = 20;
      const totalWidth = config.textSlides.length * indicatorSpacing;
      let indicatorX = (VIDEO_WIDTH - totalWidth) / 2;

      config.textSlides.forEach((_, index) => {
        if (index === slideIndex) {
          ctx.fillStyle = 'rgba(255, 255, 255, 1)';
          roundRect(ctx, indicatorX, indicatorY, 40, 8, 4);
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          roundRect(ctx, indicatorX, indicatorY, 8, 8, 4);
        }
        ctx.fill();
        indicatorX += indicatorSpacing;
      });
    }

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
