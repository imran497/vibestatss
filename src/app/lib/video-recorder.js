import confetti from "canvas-confetti";
import { loadAudio } from "./music-library";
import { getTemplate } from "../components/templates/registry";

/**
 * Canvas-based video recorder for smooth, high-quality MP4 video generation
 * Uses H.264 codec for maximum compatibility
 * All settings are read from config for single source of truth
 */
export async function recordVideo(config) {
  console.log('🎬 Initializing video recorder with config:', config);

  // Read export settings from config (with fallback defaults)
  const VIDEO_WIDTH = config.export?.width || 1920;
  const VIDEO_HEIGHT = config.export?.height || 1080;
  const FRAME_RATE = config.export?.fps || 60;
  const CONFETTI_DURATION = (config.export?.confettiDuration || 8) * 1000; // Convert to ms

  // Get template and calculate durations using template-specific logic
  const template = getTemplate(config.type);
  if (!template) {
    throw new Error(`Unknown template type: ${config.type}`);
  }

  const { COUNTER_DURATION } = template.recorder.calculateDuration(config, CONFETTI_DURATION);
  const DURATION = COUNTER_DURATION + CONFETTI_DURATION;

  // Wait for fonts to load
  const fontMap = {
    'Inter': 'Inter',
    'Outfit': 'Outfit',
    'Playfair Display': 'Playfair Display',
    'Space Mono': 'Space Mono'
  };
  const fontFamily = fontMap[config.style.font] || 'Inter';

  try {
    await document.fonts.load(`900 288px "${fontFamily}"`);
    console.log('✓ Font loaded:', fontFamily);
  } catch (err) {
    console.warn('Font loading failed, continuing anyway:', err);
  }

  // 1. Setup main canvas for video content
  const canvas = document.createElement("canvas");
  canvas.width = VIDEO_WIDTH;
  canvas.height = VIDEO_HEIGHT;
  const ctx = canvas.getContext("2d", {
    alpha: false,
    willReadFrequently: false
  });

  // Enable high-quality rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 2. Setup separate canvas for confetti layer
  const confettiCanvas = document.createElement("canvas");
  confettiCanvas.width = VIDEO_WIDTH;
  confettiCanvas.height = VIDEO_HEIGHT;

  const myConfetti = confetti.create(confettiCanvas, {
    resize: false,
    useWorker: false,
  });

  // Generate confetti colors based on text color
  const generateConfettiColors = (textStyle) => {
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 139, g: 92, b: 246 }; // fallback purple
    };

    const rgbToHex = (r, g, b) => {
      return "#" + [r, g, b].map(x => {
        const hex = Math.round(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      }).join('');
    };

    const interpolateColor = (color1, color2, factor) => {
      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);
      return rgbToHex(
        c1.r + (c2.r - c1.r) * factor,
        c1.g + (c2.g - c1.g) * factor,
        c1.b + (c2.b - c1.b) * factor
      );
    };

    const adjustBrightness = (hex, percent) => {
      const rgb = hexToRgb(hex);
      return rgbToHex(
        Math.min(255, rgb.r * (1 + percent)),
        Math.min(255, rgb.g * (1 + percent)),
        Math.min(255, rgb.b * (1 + percent))
      );
    };

    if (textStyle.type === 'gradient') {
      // Use gradient colors and interpolate between them
      return [
        textStyle.color1,
        interpolateColor(textStyle.color1, textStyle.color2, 0.33),
        interpolateColor(textStyle.color1, textStyle.color2, 0.5),
        interpolateColor(textStyle.color1, textStyle.color2, 0.66),
        textStyle.color2
      ];
    } else {
      // Generate variations of the solid color
      const baseColor = textStyle.color1;
      return [
        adjustBrightness(baseColor, -0.3),
        adjustBrightness(baseColor, -0.15),
        baseColor,
        adjustBrightness(baseColor, 0.15),
        adjustBrightness(baseColor, 0.3)
      ];
    }
  };

  const fireConfetti = () => {
    const colors = generateConfettiColors(config.style.text);
    const fire = () => {
            myConfetti({
                particleCount: 30,
                angle: 60,
                spread: 150,
                origin: { x: 0.2 },
                colors,
                ticks: 8000,
                gravity: 0.8,
                scalar: 2.5,
                drift: 0,
            });
            myConfetti({
                particleCount: 30,
                angle: 120,
                spread: 150,
                origin: { x: 0.8 },
                colors,
                ticks: 8000,
                gravity: 0.8,
                scalar: 2.5,
                drift: 0,
            });
    };

    // Fire 8 bursts over 3 seconds
    fire();
    setTimeout(fire, 150);
    setTimeout(fire, 300);
    setTimeout(fire, 1000);
    setTimeout(fire, 1500);
    setTimeout(fire, 2000);
    setTimeout(fire, 2500);
    setTimeout(fire, 3000);
  };

  // 4. MP4 export
  return await exportMP4(canvas, ctx, confettiCanvas, fireConfetti, config);
}

// MP4 Export using VideoEncoder
async function exportMP4(canvas, ctx, confettiCanvas, fireConfetti, config) {
  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');

  // Read export settings from config (same as recordVideo)
  const VIDEO_WIDTH = config.export?.width || 1920;
  const VIDEO_HEIGHT = config.export?.height || 1080;
  const FRAME_RATE = config.export?.fps || 60;
  const CONFETTI_DURATION = (config.export?.confettiDuration || 8) * 1000;

  // Calculate durations based on template type
  let COUNTER_DURATION = 2000;
  if (config.type === 'dailyUpdate') {
    COUNTER_DURATION = config.dailyUpdate.sequence.reduce((sum, seq) => sum + (seq.duration * 1000), 0);
  } else if (config.type === 'follower') {
    COUNTER_DURATION = (config.followerCount.duration || 2) * 1000;
  }

  const DURATION = COUNTER_DURATION + CONFETTI_DURATION;

  // Get font family for rendering
  const fontMap = {
    'Inter': 'Inter',
    'Outfit': 'Outfit',
    'Playfair Display': 'Playfair Display',
    'Space Mono': 'Space Mono'
  };
  const fontFamily = fontMap[config.style.font] || 'Inter';

  // Load audio if music is selected
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

  // Add audio track if music is selected
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
    error: (e) => console.error('❌ VideoEncoder error:', e)
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
      bitrate: 10000000,
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
    console.error('❌ No H.264 codec supported. Falling back to WebM...');
    throw new Error('MP4_NOT_SUPPORTED');
  }

  console.log('✓ Using codec:', codecConfig.codec);
  videoEncoder.configure(codecConfig);

  console.log('✓ MP4 encoder configured');

  // Setup audio encoder if music is selected
  let audioEncoder = null;
  if (hasAudio) {
    audioEncoder = new AudioEncoder({
      output: (chunk, meta) => muxer.addAudioChunk(chunk, meta),
      error: (e) => console.error('❌ AudioEncoder error:', e)
    });

    audioEncoder.configure({
      codec: 'mp4a.40.2', // AAC-LC
      sampleRate: audio.audioBuffer.sampleRate,
      numberOfChannels: audio.audioBuffer.numberOfChannels,
      bitrate: 128000 // 128 kbps
    });

    console.log('✓ Audio encoder configured');

    // Encode audio samples
    const audioDuration = Math.min(audio.audioBuffer.duration, DURATION / 1000);
    const sampleRate = audio.audioBuffer.sampleRate;
    const totalSamples = Math.floor(audioDuration * sampleRate);
    const samplesPerFrame = 1024; // AAC frame size

    for (let i = 0; i < totalSamples; i += samplesPerFrame) {
      const frameSamples = Math.min(samplesPerFrame, totalSamples - i);
      const audioData = new Float32Array(frameSamples * audio.audioBuffer.numberOfChannels);

      // Extract samples from audio buffer
      for (let ch = 0; ch < audio.audioBuffer.numberOfChannels; ch++) {
        const channelData = audio.audioBuffer.getChannelData(ch);
        for (let s = 0; s < frameSamples; s++) {
          audioData[s * audio.audioBuffer.numberOfChannels + ch] = channelData[i + s] || 0;
        }
      }

      const audioFrame = new AudioData({
        format: 'f32', // Interleaved format
        sampleRate: audio.audioBuffer.sampleRate,
        numberOfFrames: frameSamples,
        numberOfChannels: audio.audioBuffer.numberOfChannels,
        timestamp: (i / sampleRate) * 1000000,
        data: audioData
      });

      audioEncoder.encode(audioFrame);
      audioFrame.close();
    }

    console.log('✓ Audio encoded');
  }

  // Get template-specific duration calculator
  const template = getTemplate(config.type);
  if (!template) {
    throw new Error(`Unknown template type: ${config.type}`);
  }

  const { COUNTER_DURATION: templateCounterDuration, videoDuration } =
    template.recorder.calculateDuration(config, CONFETTI_DURATION);

  const totalFrames = Math.ceil((videoDuration / 1000) * FRAME_RATE);
  let confettiTriggered = false;
  let lastSequenceIndex = -1;
  let transitionStartFrame = 0;

  console.log(`📹 Encoding ${totalFrames} frames for ${config.type} mode...`);

  for (let frameNum = 0; frameNum < totalFrames; frameNum++) {
    const elapsed = (frameNum / FRAME_RATE) * 1000;

    // Use template-specific rendering logic
    const renderResult = await template.recorder.renderFrame({
      canvas,
      ctx,
      config,
      elapsed,
      frameNum,
      lastSequenceIndex,
      transitionStartFrame,
      confettiTriggered,
      COUNTER_DURATION: templateCounterDuration,
      FRAME_RATE,
      VIDEO_WIDTH,
      VIDEO_HEIGHT,
      fontFamily
    });

    const { content, animationState, shouldTriggerConfetti } = renderResult;

    // Update state if template returns new values
    if (renderResult.currentIndex !== undefined) {
      lastSequenceIndex = renderResult.currentIndex;
    }
    if (renderResult.transitionStartFrame !== undefined) {
      transitionStartFrame = renderResult.transitionStartFrame;
    }

    // Use template-specific drawFrame function
    template.recorder.drawFrame({
      ctx,
      config,
      content,
      animationState,
      VIDEO_WIDTH,
      VIDEO_HEIGHT,
      fontFamily
    });

    // Composite confetti layer on top
    ctx.drawImage(confettiCanvas, 0, 0);

    // Trigger confetti based on mode
    if (shouldTriggerConfetti && !confettiTriggered) {
      confettiTriggered = true;
      console.log('🎉 Triggering confetti');
      fireConfetti();
    }

    // Wait for confetti animation to render
    await new Promise(resolve => requestAnimationFrame(resolve));

    // Capture frame directly from canvas
    const frame = new VideoFrame(canvas, {
      timestamp: (frameNum * 1000000) / FRAME_RATE
    });

    videoEncoder.encode(frame, { keyFrame: frameNum % 60 === 0 });
    frame.close();

    if (frameNum % 60 === 0) {
      console.log(`  ${frameNum}/${totalFrames} (${((frameNum/totalFrames)*100).toFixed(1)}%)`);
    }
  }

  await videoEncoder.flush();
  if (hasAudio && audioEncoder) {
    await audioEncoder.flush();
  }
  muxer.finalize();

  const { buffer } = muxer.target;
  const blob = new Blob([buffer], { type: 'video/mp4' });
  console.log('✅ MP4 generated:', blob.size, 'bytes');
  return blob;
}

