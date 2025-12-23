import { loadAudio } from "../../../lib/music-library";

export async function recordVideo(config) {
  console.log('🎬 Initializing launch announcement video recorder');

  const VIDEO_WIDTH = config.export?.width || 1920;
  const VIDEO_HEIGHT = config.export?.height || 1080;
  const FRAME_RATE = config.export?.fps || 60;
  const DURATION = (config.duration || 10) * 1000;

  // Extract font name from CSS variable format
  const extractFontName = (fontValue) => {
    const fontMap = {
      'var(--font-inter)': 'Inter',
      'var(--font-outfit)': 'Outfit',
      'var(--font-poppins)': 'Poppins',
      'var(--font-montserrat)': 'Montserrat',
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

    // Check if fontValue contains a CSS variable
    for (const [cssVar, fontName] of Object.entries(fontMap)) {
      if (fontValue && fontValue.includes(cssVar)) {
        return fontName;
      }
    }

    return 'Outfit'; // Default fallback
  };

  const fontFamily = extractFontName(config.font);

  console.log('🔤 Preloading font:', fontFamily);
  try {
    await Promise.all([
      document.fonts.load(`300 16px "${fontFamily}"`),
      document.fonts.load(`400 16px "${fontFamily}"`),
      document.fonts.load(`500 16px "${fontFamily}"`),
      document.fonts.load(`600 16px "${fontFamily}"`),
      document.fonts.load(`700 16px "${fontFamily}"`),
      document.fonts.load(`800 16px "${fontFamily}"`),
      document.fonts.load(`900 16px "${fontFamily}"`),
    ]);
    console.log('✓ Font loaded:', fontFamily);
  } catch (err) {
    console.warn('⚠️ Font loading failed, continuing anyway:', err);
  }

  // Load logos and background image using fetch to avoid CORS issues
  let productLogo = null;
  let platformLogo = null;
  let backgroundImage = null;

  // Helper function to load image (handles data URLs and regular URLs)
  const loadImageAsBlob = async (url) => {
    try {
      // Data URLs can be loaded directly without fetch
      if (url.startsWith('data:')) {
        const img = new Image();
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });
        return img;
      }

      // For regular URLs, try fetch with blob
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Failed to fetch image');
      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = objectURL;
      });

      return img;
    } catch (error) {
      console.warn('Failed to load image:', url, error);
      return null;
    }
  };

  if (config.product.logo) {
    console.log('📥 Loading product logo:', config.product.logo);
    productLogo = await loadImageAsBlob(config.product.logo);
    console.log('✓ Product logo loaded:', productLogo ? 'SUCCESS' : 'FAILED');
  }

  if (config.platform.logo) {
    console.log('📥 Loading platform logo:', config.platform.logo);
    platformLogo = await loadImageAsBlob(config.platform.logo);
    console.log('✓ Platform logo loaded:', platformLogo ? 'SUCCESS' : 'FAILED');
  }

  // Load background image
  if (config.backgroundImage) {
    console.log('📥 Loading background image:', config.backgroundImage);
    backgroundImage = await loadImageAsBlob(`/abstract/${config.backgroundImage}.jpg`);
    console.log('✓ Background image loaded:', backgroundImage ? 'SUCCESS' : 'FAILED');
  }

  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_WIDTH;
  canvas.height = VIDEO_HEIGHT;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return await exportMP4(canvas, ctx, config, productLogo, platformLogo, backgroundImage, fontFamily);
}

async function exportMP4(canvas, ctx, config, productLogo, platformLogo, backgroundImage, fontFamily) {
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');

  const VIDEO_WIDTH = config.export?.width || 1920;
  const VIDEO_HEIGHT = config.export?.height || 1080;
  const FRAME_RATE = config.export?.fps || 60;
  const DURATION = (config.duration || 10) * 1000;

  const audio = await loadAudio(config.music);
  const hasAudio = audio !== null;

  const muxerConfig = {
    target: new ArrayBufferTarget(),
    video: {
      codec: 'avc',
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      frameRate: FRAME_RATE
    },
    fastStart: 'in-memory'
  };

  if (hasAudio) {
    muxerConfig.audio = {
      codec: 'aac',
      sampleRate: audio.audioBuffer.sampleRate,
      numberOfChannels: audio.audioBuffer.numberOfChannels
    };
  }

  const muxer = new Muxer(muxerConfig);

  const videoEncoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: (e) => console.error('VideoEncoder error:', e)
  });

  // Try different H.264 codec profiles in order of preference
  const codecCandidates = [
    'avc1.42001E', // Baseline Profile, Level 3.0
    'avc1.42E01E', // High Profile, Level 3.0
    'avc1.4D401E', // Main Profile, Level 3.0
    'avc1.640028', // High Profile, Level 4.0
  ];

  let finalCodecConfig = null;
  for (const codec of codecCandidates) {
    const config = {
      codec,
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      bitrate: 10000000,
      framerate: FRAME_RATE,
      hardwareAcceleration: 'no-preference'
    };

    const support = await VideoEncoder.isConfigSupported(config);
    console.log(`Checking codec ${codec}:`, support.supported ? '✓ supported' : '✗ not supported');

    if (support.supported) {
      finalCodecConfig = config;
      break;
    }
  }

  if (!finalCodecConfig) {
    console.error('❌ No H.264 codec supported. Falling back to WebM...');
    throw new Error('MP4_NOT_SUPPORTED');
  }

  console.log('✓ Using codec:', finalCodecConfig.codec);
  videoEncoder.configure(finalCodecConfig);

  let audioEncoder = null;
  if (hasAudio) {
    audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => console.error('AudioEncoder error:', e)
    });

    audioEncoder.configure({
      codec: 'mp4a.40.2',
      sampleRate: audio.audioBuffer.sampleRate,
      numberOfChannels: audio.audioBuffer.numberOfChannels,
      bitrate: 128000
    });

    const audioDuration = Math.min(audio.audioBuffer.duration, DURATION / 1000);
    const sampleRate = audio.audioBuffer.sampleRate;
    const totalSamples = Math.floor(audioDuration * sampleRate);
    const samplesPerFrame = 1024;

    for (let i = 0; i < totalSamples; i += samplesPerFrame) {
      const frameSamples = Math.min(samplesPerFrame, totalSamples - i);
      const audioData = new Float32Array(frameSamples * audio.audioBuffer.numberOfChannels);

      for (let ch = 0; ch < audio.audioBuffer.numberOfChannels; ch++) {
        const channelData = audio.audioBuffer.getChannelData(ch);
        for (let s = 0; s < frameSamples; s++) {
          audioData[s * audio.audioBuffer.numberOfChannels + ch] = channelData[i + s] || 0;
        }
      }

      const audioFrame = new AudioData({
        format: 'f32',
        sampleRate: audio.audioBuffer.sampleRate,
        numberOfFrames: frameSamples,
        numberOfChannels: audio.audioBuffer.numberOfChannels,
        timestamp: (i / sampleRate) * 1000000,
        data: audioData
      });

      audioEncoder.encode(audioFrame);
      audioFrame.close();
    }
  }

  const totalFrames = Math.ceil((DURATION / 1000) * FRAME_RATE);
  console.log(`Encoding ${totalFrames} frames...`);

  for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
    const progress = frameNum / totalFrames;
    drawFrame(ctx, config, progress, productLogo, platformLogo, backgroundImage, fontFamily, VIDEO_WIDTH, VIDEO_HEIGHT);

    const frame = new VideoFrame(canvas, {
      timestamp: (frameNum * 1000000) / FRAME_RATE
    });

    videoEncoder.encode(frame, { keyFrame: frameNum % 60 === 0 });
    frame.close();

    if (frameNum % 60 === 0) {
      console.log(`${frameNum}/${totalFrames} (${((frameNum / totalFrames) * 100).toFixed(1)}%)`);
    }
  }

  await videoEncoder.flush();
  if (hasAudio && audioEncoder) {
    await audioEncoder.flush();
  }
  muxer.finalize();

  const { buffer } = muxer.target;
  const blob = new Blob([buffer], { type: 'video/mp4' });
  console.log('MP4 generated:', blob.size, 'bytes');
  return blob;
}

// Helper function to create canvas gradient from CSS direction
function createCanvasGradient(ctx, gradientConfig, width, height) {
  const { color1, color2, direction } = gradientConfig;

  // Map CSS gradient directions to canvas coordinates
  const directionMap = {
    'to right': { x0: 0, y0: 0, x1: width, y1: 0 },
    'to left': { x0: width, y0: 0, x1: 0, y1: 0 },
    'to bottom': { x0: 0, y0: 0, x1: 0, y1: height },
    'to top': { x0: 0, y0: height, x1: 0, y1: 0 },
    'to bottom right': { x0: 0, y0: 0, x1: width, y1: height },
    'to bottom left': { x0: width, y0: 0, x1: 0, y1: height },
    'to top right': { x0: 0, y0: height, x1: width, y1: 0 },
    'to top left': { x0: width, y0: height, x1: 0, y1: 0 },
  };

  const coords = directionMap[direction] || directionMap['to bottom right'];
  const gradient = ctx.createLinearGradient(coords.x0, coords.y0, coords.x1, coords.y1);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);

  return gradient;
}

function drawFrame(ctx, config, progress, productLogo, platformLogo, backgroundImage, fontFamily, width, height) {
  // Calculate elapsed time from progress
  const totalDuration = (config.duration || 10) * 1000; // ms
  const elapsed = progress * totalDuration;

  // Draw background - Image or Gradient
  if (config.backgroundType === 'image' && backgroundImage) {
    // Image background with blur
    ctx.save();
    ctx.filter = 'blur(8px)';
    ctx.drawImage(backgroundImage, 0, 0, width, height);
    ctx.filter = 'none';
    ctx.restore();

    // White semi-transparent overlay for mirror effect
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, 0, width, height);

    // Additional mirror/glass effect overlay
    const mirrorGrad = ctx.createLinearGradient(0, 0, width, height);
    mirrorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.20)');
    mirrorGrad.addColorStop(0.5, 'transparent');
    mirrorGrad.addColorStop(1, 'rgba(255, 255, 255, 0.20)');
    ctx.fillStyle = mirrorGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (config.backgroundType === 'gradient') {
    // Gradient background
    const gradient = createCanvasGradient(ctx, config.backgroundGradient, width, height);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Fallback solid color
    ctx.fillStyle = config.colors.background;
    ctx.fillRect(0, 0, width, height);
  }

  // White background box for content (p-5 = 20px padding, 0.8 opacity)
  // Preview: p-5 = 20px, rounded-2xl = 16px
  const scaleFactor = width / 600;
  const padding = 20 * scaleFactor; // p-5 in preview
  const boxX = padding;
  const boxY = padding;
  const boxWidth = width - (padding * 2);
  const boxHeight = height - (padding * 2);
  const borderRadius = 16 * scaleFactor; // rounded-2xl in preview

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxWidth, boxHeight, borderRadius);
  ctx.fill();

  const positions = getPositions(elapsed, totalDuration, width, height);

  // Scale factor from preview (600px) to export (1920px) = 3.2x
  // Preview: text-5xl=48px, text-3xl=30px, text-xl=20px, logo=48px
  const scale = width / 600;
  const logoSize = 48 * scale; // 48px in preview → 153.6px at 1920px
  const productNameFontSize = 30 * scale; // text-3xl → 96px at 1920px
  const platformNameFontSize = 30 * scale; // text-3xl → 96px at 1920px
  const connectingTextFontSize = 20 * scale; // text-xl → 64px at 1920px
  const typeTextFontSize = 48 * scale; // text-5xl → 153.6px at 1920px
  const itemGap = 16 * scale; // gap-4 → 51.2px at 1920px
  const logoTextGap = 12 * scale; // gap-3 → 38.4px at 1920px

  const cx = width / 2;
  const cy = height / 2;

  // Screen 1: Type text with bounce animation
  if (positions.screen1.opacity > 0) {
    ctx.save();
    ctx.globalAlpha = positions.screen1.opacity;
    ctx.fillStyle = config.colors.text;
    ctx.font = `${config.fontWeight || 'bold'} ${typeTextFontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const typeText = config.type === 'launching' ? 'Launching' : 'Featuring';
    const scale = positions.screen1.scale || 1;
    const translateY = positions.screen1.translateY || 0;
    ctx.translate(cx, cy + translateY);
    ctx.scale(scale, scale);
    ctx.fillText(typeText, 0, 0);
    ctx.restore();
  }

  // Screen 2: Line 1 - Product Logo + Name
  if (positions.product.opacity > 0) {
    ctx.save();
    ctx.globalAlpha = positions.product.opacity;

    const offsetX = positions.product.offsetX || 0;
    // Position product line above center, with proper gap spacing
    const productY = cy - (productNameFontSize / 2 + itemGap + connectingTextFontSize / 2);

    // Measure text width to calculate total width
    ctx.font = `${config.fontWeight || 'bold'} ${productNameFontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(config.product.name).width;
    const totalWidth = logoSize + logoTextGap + textWidth;

    // Center the entire row (logo + text)
    const startX = cx - totalWidth / 2 + offsetX;
    const logoX = startX + logoSize / 2;
    const textX = startX + logoSize + logoTextGap;

    // Draw logo
    if (productLogo) {
      const ar = productLogo.width / productLogo.height;
      let dw = logoSize, dh = logoSize;
      if (ar > 1) dh = logoSize / ar;
      else dw = logoSize * ar;
      ctx.drawImage(productLogo, logoX - dw / 2, productY - dh / 2, dw, dh);
    } else {
      ctx.fillStyle = config.colors.accent;
      ctx.beginPath();
      ctx.roundRect(logoX - logoSize / 2, productY - logoSize / 2, logoSize, logoSize, 20 * scale);
      ctx.fill();
      ctx.fillStyle = config.colors.background;
      ctx.font = `bold ${logoSize * 0.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.product.name.charAt(0).toUpperCase(), logoX, productY);
    }

    // Draw product name
    ctx.fillStyle = config.colors.text;
    ctx.font = `${config.fontWeight || 'bold'} ${productNameFontSize}px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.product.name, textX, productY);

    ctx.restore();
  }

  // Line 2: "on" text
  if (positions.text.opacity > 0) {
    ctx.save();
    ctx.globalAlpha = positions.text.opacity;
    const scale = positions.text.scale || 1;
    ctx.fillStyle = config.colors.secondary;
    ctx.font = `${config.fontWeight || '600'} ${connectingTextFontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillText('on', 0, 0);
    ctx.restore();
  }

  // Screen 2: Line 3 - Platform Logo + Name
  if (positions.platform.opacity > 0) {
    ctx.save();
    ctx.globalAlpha = positions.platform.opacity;

    const offsetX = positions.platform.offsetX || 0;
    // Position platform line below center, with proper gap spacing
    const platformY = cy + (connectingTextFontSize / 2 + itemGap + platformNameFontSize / 2);

    // Measure text width to calculate total width
    ctx.font = `${config.fontWeight || 'bold'} ${platformNameFontSize}px ${fontFamily}`;
    const textWidth = ctx.measureText(config.platform.name).width;
    const totalWidth = logoSize + logoTextGap + textWidth;

    // Center the entire row (logo + text)
    const startX = cx - totalWidth / 2 + offsetX;
    const logoX = startX + logoSize / 2;
    const textX = startX + logoSize + logoTextGap;

    // Draw logo
    if (platformLogo) {
      const ar = platformLogo.width / platformLogo.height;
      let dw = logoSize, dh = logoSize;
      if (ar > 1) dh = logoSize / ar;
      else dw = logoSize * ar;
      ctx.drawImage(platformLogo, logoX - dw / 2, platformY - dh / 2, dw, dh);
    } else {
      ctx.fillStyle = config.colors.secondary;
      ctx.beginPath();
      ctx.roundRect(logoX - logoSize / 2, platformY - logoSize / 2, logoSize, logoSize, 20 * scale);
      ctx.fill();
      ctx.fillStyle = config.colors.text;
      ctx.font = `bold ${logoSize * 0.4}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(config.platform.name.charAt(0).toUpperCase(), logoX, platformY);
    }

    // Draw platform name
    ctx.fillStyle = config.colors.text;
    ctx.font = `${config.fontWeight || 'bold'} ${platformNameFontSize}px ${fontFamily}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.platform.name, textX, platformY);

    ctx.restore();
  }

}

function drawLogo(ctx, logo, text, pos, bgColor, textColor, size) {
  if (pos.opacity <= 0) return;

  ctx.save();
  ctx.globalAlpha = pos.opacity;
  ctx.translate(pos.x, pos.y);
  ctx.scale(pos.scale, pos.scale);

  if (logo) {
    const ar = logo.width / logo.height;
    let dw = size, dh = size;
    if (ar > 1) dh = size / ar;
    else dw = size * ar;
    ctx.drawImage(logo, -dw / 2, -dh / 2, dw, dh);
  } else {
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(-size / 2, -size / 2, size, size, 30);
    ctx.fill();
    ctx.fillStyle = textColor;
    ctx.font = `bold ${size * 0.5}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.charAt(0).toUpperCase(), 0, 0);
  }

  ctx.restore();
}

function getPositions(elapsed, duration, w, h) {
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  // Multi-bounce easing with sequential reduction
  const easeOutBounce = (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  };

  const pos = {
    screen1: { opacity: 0, scale: 0, translateY: 0 },
    product: { opacity: 0, offsetX: -100 },
    platform: { opacity: 0, offsetX: 100 },
    text: { opacity: 0, scale: 0 }
  };

  // Screen 1:
  // 0 - 800ms: Scale in with multiple bounces (faster)
  // 800 - 2000ms: Stay
  // 2000 - 2500ms: Fade out and move up
  if (elapsed < 2500) {
    if (elapsed < 800) {
      const t = easeOutBounce(elapsed / 800);
      pos.screen1.opacity = 1;
      pos.screen1.scale = t;
      pos.screen1.translateY = 0;
    } else if (elapsed < 2000) {
      pos.screen1.opacity = 1;
      pos.screen1.scale = 1;
      pos.screen1.translateY = 0;
    } else {
      const t = (elapsed - 2000) / 500;
      pos.screen1.opacity = 1 - t;
      pos.screen1.scale = 1;
      pos.screen1.translateY = t * -30 * (w / 600);
    }
  }
  // Screen 2:
  // 2500 - 5500ms: Elements animate in (3s)
  // 5500 - 13000ms: Stay (7.5s)
  // 13000 - 15000ms: Reverse exit (2s)
  else {
    let t;
    if (elapsed < 5500) {
      // In animation (3s)
      t = easeOutCubic((elapsed - 2500) / 3000);
    } else if (elapsed < 13000) {
      // Stay (7.5s)
      t = 1;
    } else {
      // Reverse exit (2s)
      const exitT = Math.min(1, (elapsed - 13000) / 2000);
      t = 1 - exitT;
    }

    pos.product.opacity = t;
    pos.product.offsetX = (1 - t) * -100;
    pos.text.opacity = t;
    pos.text.scale = t;
    pos.platform.opacity = t;
    pos.platform.offsetX = (1 - t) * 100;
  }

  return pos;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  const startY = y - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}
