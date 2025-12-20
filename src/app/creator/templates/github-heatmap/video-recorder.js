/**
 * Video recorder for GitHub Heatmap template
 * Renders contribution heatmap frame-by-frame to MP4
 */

// Color scheme presets (matching VideoBox and LeftPanel)
const COLOR_PRESETS = {
  github: {
    level0: '#161b22',
    level1: '#0e4429',
    level2: '#006d32',
    level3: '#26a641',
    level4: '#39d353',
  },
  heat: {
    level0: '#1a1a1a',
    level1: '#4a1a1a',
    level2: '#8b2e00',
    level3: '#d45500',
    level4: '#ff7700',
  },
  ocean: {
    level0: '#0a192f',
    level1: '#112240',
    level2: '#1e3a5f',
    level3: '#2e5a8a',
    level4: '#64b5f6',
  },
  forest: {
    level0: '#0d1b0d',
    level1: '#1b3d1b',
    level2: '#2e5e2e',
    level3: '#4a8f4a',
    level4: '#7bc67b',
  },
  sunset: {
    level0: '#1a1a2e',
    level1: '#4a2c5e',
    level2: '#7a4e8e',
    level3: '#d97ba9',
    level4: '#ffa3c7',
  },
};

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
  console.log('🎬 Initializing GitHub Heatmap video recorder...');

  // Round dimensions to even numbers (required for H.264 codec)
  const VIDEO_WIDTH = Math.round(config.export.width / 2) * 2;
  const VIDEO_HEIGHT = Math.round(config.export.height / 2) * 2;
  const FRAME_RATE = config.export.fps || 60;
  const TOTAL_DURATION = (config.export.duration || 5) * 1000; // milliseconds
  const TOTAL_FRAMES = Math.floor((TOTAL_DURATION / 1000) * FRAME_RATE);

  console.log(`📐 Video dimensions: ${VIDEO_WIDTH}x${VIDEO_HEIGHT} @ ${FRAME_RATE}fps`);
  console.log(`⏱️  Duration: ${TOTAL_DURATION / 1000}s (${TOTAL_FRAMES} frames)`);

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
      hardwareAcceleration: 'no-preference',
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

  // Preload fonts
  const fontName = getCanvasFontFamily(config.font);
  if (fontName !== 'sans-serif' && fontName !== 'system-ui') {
    console.log('🔤 Preloading font:', fontName);
    try {
      await Promise.all([
        document.fonts.load(`400 16px "${fontName}"`),
        document.fonts.load(`700 16px "${fontName}"`),
        document.fonts.load(`800 16px "${fontName}"`),
      ]);
      console.log('✓ Font loaded');
    } catch (err) {
      console.warn(`⚠️ Failed to load font ${fontName}:`, err.message);
    }
  }

  // Setup canvas
  const canvas = document.createElement('canvas');
  canvas.width = VIDEO_WIDTH;
  canvas.height = VIDEO_HEIGHT;
  const ctx = canvas.getContext('2d', {
    alpha: false,
    willReadFrequently: false,
  });

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Extract data
  const { grid, username } = config.contributionData;
  const totalCols = grid[0].length;

  // Filter data based on selected time range
  const getFilteredData = () => {
    const now = new Date();
    let startDate;
    let endDate;

    switch (config.timeRange) {
      case 'month':
        // Current month: from 1st to last day of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
        break;
      case '3month':
        // Current month + last 2 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case '6month':
        // Current month + last 5 months
        startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'year':
        // Current year: Jan 1 to Dec 31
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
    }

    // Build grid starting from first date in range to last date
    const filteredGrid = [[], [], [], [], [], [], []]; // 7 rows (Sun-Sat)

    // Find all dates in the original grid that fall within range
    const datesInRange = new Map(); // date string -> cell data
    for (let weekIdx = 0; weekIdx < grid[0].length; weekIdx++) {
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const cell = grid[dayIdx][weekIdx];
        if (cell && cell.date) {
          const cellDate = new Date(cell.date);
          if (cellDate >= startDate && cellDate <= endDate) {
            datesInRange.set(cell.date, cell);
          }
        }
      }
    }

    // Build weeks from startDate to endDate
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(startDate);
    let currentWeek = [null, null, null, null, null, null, null];
    let weekStarted = false;

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
      const dateStr = currentDate.toISOString().split('T')[0];

      // Add cell from existing data or create future date cell
      const existingCell = datesInRange.get(dateStr);
      if (existingCell) {
        currentWeek[dayOfWeek] = existingCell;
        weekStarted = true;
      } else if (currentDate > today) {
        // Create cell for future date with 0 contributions
        currentWeek[dayOfWeek] = {
          date: dateStr,
          count: 0,
          level: 0,
        };
        weekStarted = true;
      } else {
        // Past date with no data - leave as null
        currentWeek[dayOfWeek] = null;
      }

      // End of week (Saturday) or last date
      if (dayOfWeek === 6 || currentDate.getTime() === endDate.getTime()) {
        // Only add week if it has started
        if (weekStarted || currentWeek.some(c => c !== null)) {
          for (let i = 0; i < 7; i++) {
            filteredGrid[i].push(currentWeek[i]);
          }
        }
        currentWeek = [null, null, null, null, null, null, null];
        weekStarted = false;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add any remaining partial week
    if (currentWeek.some(c => c !== null)) {
      for (let i = 0; i < 7; i++) {
        filteredGrid[i].push(currentWeek[i]);
      }
    }

    // Calculate total contributions for filtered data
    let filteredTotal = 0;
    filteredGrid.forEach(row => {
      row.forEach(cell => {
        if (cell) filteredTotal += cell.count;
      });
    });

    return { grid: filteredGrid, totalContributions: filteredTotal };
  };

  const { grid: filteredGrid, totalContributions: filteredTotal } = getFilteredData();

  // Organize grid by calendar months (each month gets its own grid)
  const organizeByMonths = () => {
    const monthMap = new Map();

    // Group all cells by their actual month
    for (let weekIdx = 0; weekIdx < filteredGrid[0].length; weekIdx++) {
      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        const cell = filteredGrid[dayIdx][weekIdx];
        if (!cell || !cell.date) continue;

        const date = new Date(cell.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, {
            monthKey,
            monthName: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            cells: [], // Array of {date, dayOfWeek, cell}
          });
        }

        monthMap.get(monthKey).cells.push({
          date: cell.date,
          dayOfWeek: dayIdx,
          cell: cell,
        });
      }
    }

    // Build grid for each month
    const monthSections = [];
    for (const [monthKey, monthData] of monthMap.entries()) {
      // Sort cells by date
      monthData.cells.sort((a, b) => a.date.localeCompare(b.date));

      // Build weeks for this month
      const monthGrid = [[], [], [], [], [], [], []]; // 7 rows
      let currentWeek = [null, null, null, null, null, null, null];
      let weekHasData = false;

      monthData.cells.forEach((item, idx) => {
        const { dayOfWeek, cell } = item;
        currentWeek[dayOfWeek] = cell;
        weekHasData = true;

        // Check if this is the last cell or next cell starts a new week
        const isLastCell = idx === monthData.cells.length - 1;
        const nextCellStartsNewWeek = !isLastCell && monthData.cells[idx + 1].dayOfWeek <= dayOfWeek;

        if (dayOfWeek === 6 || isLastCell || nextCellStartsNewWeek) {
          // Add this week to the grid
          if (weekHasData) {
            for (let i = 0; i < 7; i++) {
              monthGrid[i].push(currentWeek[i]);
            }
          }
          currentWeek = [null, null, null, null, null, null, null];
          weekHasData = false;
        }
      });

      monthSections.push({
        monthKey,
        monthName: monthData.monthName,
        grid: monthGrid,
      });
    }

    return monthSections.sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  };

  const monthSections = organizeByMonths();
  const totalSections = monthSections.length;

  // Determine layout based on number of months
  const getGridLayout = (monthCount) => {
    if (monthCount <= 3) {
      return { rows: 1, cols: monthCount }; // Single row
    } else if (monthCount <= 6) {
      return { rows: 2, cols: 3 }; // 2×3
    } else if (monthCount <= 12) {
      return { rows: 2, cols: 6 }; // 2×6
    } else {
      return { rows: 4, cols: 4 }; // 4×4 for more than 12 months
    }
  };

  const layout = getGridLayout(totalSections);

  // Use config values and scale for export resolution
  // Scale factor based on video width vs preview width (1200 / 780 ≈ 1.54)
  const exportScale = VIDEO_WIDTH / 780;
  const cellSize = config.cellSize * exportScale;
  const cellGap = config.cellGap * exportScale;
  const cornerRadius = config.cornerRadius * exportScale;

  // Find max weeks in any month section
  const maxWeeksInMonth = Math.max(...monthSections.map(m => m.grid[0].length), 1);

  // Day label dimensions
  const dayLabelWidth = config.showDayLabels ? cellSize * 2.5 : 0;
  const monthLabelHeight = config.showMonthLabels ? cellSize * 1.2 + cellGap * 2 : 0;

  // Calculate grid dimensions for multi-section layout
  const sectionGridWidth = (maxWeeksInMonth * (cellSize + cellGap)) + dayLabelWidth + cellGap * 2;
  const sectionGridHeight = (7 * (cellSize + cellGap)) + monthLabelHeight;

  const totalGridWidth = layout.cols * sectionGridWidth + (layout.cols - 1) * 40; // 40px gap between sections
  const totalGridHeight = layout.rows * sectionGridHeight + (layout.rows - 1) * 40;

  // Calculate offsets to center content
  const headerHeight = config.showUsername ? 100 : 40;
  const footerHeight = config.showTotalCount ? 80 : 40;

  const totalContentHeight = headerHeight + totalGridHeight + footerHeight;

  const offsetX = (VIDEO_WIDTH - totalGridWidth) / 2;
  const offsetY = (VIDEO_HEIGHT - totalContentHeight) / 2;

  // Day labels
  const dayLabels = ['Mon', 'Wed', 'Fri'];
  const dayIndices = [1, 3, 5];

  // Generate random delays for random animation
  const randomDelays = [];
  const totalCells = 7 * filteredGrid[0].length;
  for (let i = 0; i < totalCells; i++) {
    randomDelays.push(Math.random());
  }
  const sortedDelays = randomDelays.slice().sort((a, b) => a - b);
  const normalizedDelays = sortedDelays.map((_, idx) => idx / totalCells);

  // Get cell color
  const getCellColor = (level) => {
    const colors = config.colorScheme === 'custom'
      ? config.customColors
      : COLOR_PRESETS[config.colorScheme];
    return colors[`level${level}`] || colors.level0;
  };

  // Calculate cell animation state
  const getCellAnimationState = (rowIndex, colIndex, progress) => {
    let cellProgress = 0;
    const totalFilteredCols = filteredGrid[0].length;

    switch (config.animationType) {
      case 'sequential':
        cellProgress = colIndex / totalFilteredCols;
        break;
      case 'column':
        cellProgress = colIndex / totalFilteredCols;
        break;
      case 'all-at-once':
        cellProgress = 0;
        break;
      case 'random': {
        const cellIndex = rowIndex * totalFilteredCols + colIndex;
        const randomIdx = randomDelays.indexOf(randomDelays[cellIndex]);
        cellProgress = normalizedDelays[randomIdx];
        break;
      }
      default:
        cellProgress = 0;
    }

    const animationStart = cellProgress;
    const animationDuration = 0.15; // 15% of timeline for pop animation
    const animationEnd = animationStart + animationDuration;

    if (progress < animationStart) {
      return { visible: false, scale: 0 };
    } else if (progress < animationEnd) {
      const localProgress = (progress - animationStart) / animationDuration;
      const scale = easeOut(localProgress);
      return { visible: true, scale };
    } else {
      return { visible: true, scale: 1 };
    }
  };

  // Easing function
  const easeOut = (t) => t * (2 - t);

  // Helper function to draw GitHub icon
  const drawGitHubIcon = (x, y, size, color) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 16, size / 16);
    ctx.fillStyle = color;
    ctx.beginPath();
    const path = new Path2D("M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z");
    ctx.fill(path);
    ctx.restore();
  };

  console.log(`🎬 Recording ${TOTAL_FRAMES} frames...`);

  // Render each frame
  for (let frameIndex = 0; frameIndex < TOTAL_FRAMES; frameIndex++) {
    const frame = frameIndex;
    const timestamp = (frameIndex / FRAME_RATE) * 1_000_000;
    const progress = frameIndex / TOTAL_FRAMES;
    const durationSec = TOTAL_DURATION / 1000;

    // Phase Constants (normalized to 0-1 progress)
    const PHASE_1_END = 1.5 / durationSec; // Icon/Text animation ends
    const PHASE_2_START = 1.5 / durationSec; // Transition starts
    const PHASE_2_END = 2.5 / durationSec; // Transition ends, count fully visible
    const PAUSE_END = 4.0 / durationSec; // Pause ends, count starts fading, heatmap starts
    const PHASE_3_START = 4.0 / durationSec; // Heatmap animation starts

    // Clear canvas
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw texture overlays
    ctx.save();

    // Radial gradient overlay (subtle center glow)
    const radialGradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 1.5
    );
    radialGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    radialGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    radialGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Noise texture overlay (matches preview: opacity-20 brightness-100 contrast-150)
    if (noiseTexture && noiseTexture.complete) {
      ctx.globalAlpha = 0.2;
      ctx.filter = 'brightness(1.0) contrast(1.5)';
      const pattern = ctx.createPattern(noiseTexture, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.filter = 'none';
      ctx.globalAlpha = 1.0;
    }

    ctx.restore();

    // Easing functions
    const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const easeOutElastic = (x) => {
      const c4 = (2 * Math.PI) / 3;
      return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    };

    // Phase 1: Icon Scale (0 - 0.5s)
    const iconScaleDuration = 0.5 / durationSec;
    const iconScaleProgress = Math.min(progress / iconScaleDuration, 1);
    const iconScale = easeOutElastic(iconScaleProgress);

    // Phase 1: Text Reveal (0.5s - 1.5s)
    const textRevealStart = 0.5 / durationSec;
    const textRevealDuration = 1.0 / durationSec;
    const rawUsernameRevealProgress = Math.min(Math.max((progress - textRevealStart) / textRevealDuration, 0), 1);
    const usernameRevealProgress = easeInOut(rawUsernameRevealProgress);

    // Phase 2: Transition (1.5s - 2.5s)
    const transitionDuration = 1.0 / durationSec;
    const rawTransitionProgress = Math.min(Math.max((progress - PHASE_2_START) / transitionDuration, 0), 1);
    const transitionProgress = easeInOut(rawTransitionProgress);

    // Interpolation
    const startIconSize = 120;
    const endIconSize = 32;
    const currentIconSize = startIconSize - ((startIconSize - endIconSize) * transitionProgress);

    const startFontSize = 48;
    const endFontSize = 24;
    const currentFontSize = startFontSize - ((startFontSize - endFontSize) * transitionProgress);

    const fontScale = currentFontSize / startFontSize;

    // Scale vertical positions based on video resolution
    const scaleFactor = VIDEO_WIDTH / 780;
    const startY = 0;
    const endY = -180 * scaleFactor; // Target top position (scaled) - moved up from -146
    const translateY = startY + ((endY - startY) * transitionProgress);

    // Count Animation
    const countTranslateY = 100 * scaleFactor * (1 - transitionProgress);

    // Visibility Logic (Hard Cut)
    const showCount = progress < PAUSE_END && transitionProgress > 0; // Assuming transitionProgress is phase2Progress
    const countOpacity = showCount ? transitionProgress : 0;

    // Heatmap Animation
    const showHeatmap = progress >= PAUSE_END;
    const heatmapOpacity = showHeatmap ? 1 : 0;

    // --- Draw Layer 1: Icon + Username ---
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2 + translateY);

    // Calculate total width for centering
    const fullUsername = `@${username || config.username}`;
    const canvasFont = getCanvasFontFamily(config.font);
    ctx.font = `bold ${currentFontSize}px ${canvasFont}`;
    const textMetrics = ctx.measureText(fullUsername);
    // Note: measureText width scales with font size automatically
    const textWidth = textMetrics.width;

    const startPadding = 30;
    const currentPadding = startPadding * fontScale;
    const fullTextWidth = textWidth + currentPadding;

    const currentTextContainerWidth = fullTextWidth * usernameRevealProgress;

    // Margin adjustment (interpolated)
    const startMargin = -20;
    const currentMargin = startMargin * fontScale;

    // Center the group
    // The group width effectively includes the negative margin overlap?
    // In CSS: Icon width + (Text width + margin). Margin is negative.
    // So visual width = Icon + Text + Margin.
    // Let's adjust startX calculation.
    const visualGroupWidth = currentIconSize + currentTextContainerWidth + currentMargin;
    const startX = -visualGroupWidth / 2;

    // Draw Icon
    const pathScale = currentIconSize / 16;
    ctx.save();
    ctx.translate(startX, -currentIconSize / 2);
    ctx.scale(pathScale, pathScale);
    ctx.fillStyle = config.textColor;
    const p = new Path2D("M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z");

    // Apply icon reveal scale
    ctx.translate(8, 8);
    ctx.scale(iconScale, iconScale);
    ctx.translate(-8, -8);

    ctx.fill(p);
    ctx.restore();

    // Draw Username
    if (usernameRevealProgress > 0) {
      ctx.save();
      // Position text container next to icon + margin
      ctx.translate(startX + currentIconSize + currentMargin, -currentIconSize / 2);

      // Clip for text reveal effect
      ctx.beginPath();
      // Increase clip height to prevent vertical clipping of tall fonts
      const clipHeight = currentIconSize * 3;
      const revealWidth = currentTextContainerWidth; // Use the calculated animated width
      ctx.rect(0, -clipHeight / 2, revealWidth, clipHeight);
      ctx.clip();

      // Draw text
      // Inner container has marginLeft: currentMargin, paddingLeft: currentPadding
      // In CSS, marginLeft moves the container. We applied that in translate.
      // paddingLeft moves the text inside.
      // So text x = currentPadding.
      // Wait, in CSS: marginLeft on inner div pulls it left.
      // Here we translated by currentMargin.
      // So we just draw at paddingLeft.

      ctx.fillStyle = config.textColor;
      ctx.textBaseline = 'middle';
      ctx.fillText(fullUsername, currentPadding, currentIconSize / 2);

      ctx.restore();
    }
    ctx.restore(); // End Icon/Username Group

    // --- Draw Layer 2: Contribution Count ---
    if (countOpacity > 0) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2 + countTranslateY);
      ctx.globalAlpha = countOpacity;
      ctx.fillStyle = config.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Main Count
      ctx.font = `bold 48px ${canvasFont}`;
      ctx.fillText(`${filteredTotal} Contributions`, 0, -20); // Shifted up

      // Subtitle
      const getSubtitleText = () => {
        const now = new Date();
        switch (config.timeRange) {
          case 'month':
            return `in ${now.toLocaleDateString('en-US', { month: 'long' })}`;
          case '3month':
            return 'in last 3 months';
          case '6month':
            return 'in last 6 months';
          case 'year':
            return `in ${now.getFullYear()}`;
          default:
            return '';
        }
      };

      ctx.font = `normal 24px ${canvasFont}`;
      ctx.globalAlpha = countOpacity * 0.8; // Slightly more transparent
      ctx.fillText(getSubtitleText(), 0, 20); // Shifted down (gap of 40px total)

      ctx.restore();
    }

    // --- Draw Layer 3: Heatmap ---
    if (heatmapOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = heatmapOpacity;

      // Translate to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Calculate grid layout
      const totalSections = monthSections.length;
      let rows, cols;
      if (totalSections <= 3) { rows = 1; cols = totalSections; }
      else if (totalSections <= 6) { rows = 2; cols = 3; }
      else if (totalSections <= 12) { rows = 2; cols = 6; }
      else { rows = 4; cols = 4; }

      // Scale dimensions for export resolution
      const exportScale = VIDEO_WIDTH / 780;
      const scaledCellSize = config.cellSize * exportScale;
      const scaledCellGap = config.cellGap * exportScale;
      const scaledCornerRadius = config.cornerRadius * exportScale;

      // Day labels
      const dayLabels = ['Mon', 'Wed', 'Fri'];
      const dayIndices = [1, 3, 5];

      // Calculate grid widths for each month section (cells only, no labels)
      const gridWidths = monthSections.map(section => {
        const weeks = section.grid[0].length;
        return weeks * scaledCellSize + (weeks - 1) * scaledCellGap;
      });

      // Calculate max width for each column to ensure proper grid alignment
      const colWidths = new Array(cols).fill(0);
      monthSections.forEach((_, idx) => {
        const col = idx % cols;
        colWidths[col] = Math.max(colWidths[col], gridWidths[idx]);
      });

      // Calculate total grid width based on column widths
      const sectionGap = 20 * exportScale;
      const totalGridWidth = colWidths.reduce((sum, w) => sum + w, 0) + (cols - 1) * sectionGap;

      // Height calculation (7 rows + month label space)
      const monthLabelHeight = config.showMonthLabels ? (scaledCellSize * 0.8 + scaledCellGap * 2) : 0;
      const gridRowHeight = 7 * scaledCellSize + 6 * scaledCellGap;
      const sectionHeight = monthLabelHeight + gridRowHeight;
      const totalGridHeight = rows * sectionHeight + (rows - 1) * sectionGap;

      // Account for top/bottom padding (80px top, 20px bottom in preview scale = 60px difference / 2 = 30px offset)
      const verticalOffset = 30 * exportScale; // Shift down to account for header space
      ctx.translate(-totalGridWidth / 2, -totalGridHeight / 2 + verticalOffset);

      monthSections.forEach((section, idx) => {
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        const isFirstColumn = col === 0;

        // Calculate xPos - sum of previous column widths + gaps
        let xPos = 0;
        for (let c = 0; c < col; c++) {
          xPos += colWidths[c] + sectionGap;
        }

        // Center the section within its column
        const sectionWidth = gridWidths[idx];
        const centerOffset = (colWidths[col] - sectionWidth) / 2;
        xPos += centerOffset;

        const yPos = row * (sectionHeight + sectionGap);

        ctx.save();
        ctx.translate(xPos, yPos);

        // Month Label - centered above grid
        if (config.showMonthLabels) {
          ctx.save();
          ctx.fillStyle = config.textColor;
          ctx.font = `${Math.max(scaledCellSize * 0.8, 8 * exportScale)}px ${canvasFont}`;
          ctx.globalAlpha = heatmapOpacity * 0.6;
          ctx.textAlign = 'left';
          ctx.fillText(section.monthName, 0, 0);
          ctx.globalAlpha = heatmapOpacity;
          ctx.restore();
        }

        // Translate down for the grid
        const gridY = monthLabelHeight;
        ctx.translate(0, gridY);

        // Day labels - positioned absolutely to the left (only for first column)
        if (config.showDayLabels && isFirstColumn) {
          ctx.save();
          ctx.fillStyle = config.textColor;
          ctx.font = `${Math.max(scaledCellSize * 0.7, 7 * exportScale)}px ${canvasFont}`;
          ctx.globalAlpha = heatmapOpacity * 0.5;
          ctx.textAlign = 'right';
          ctx.textBaseline = 'middle';

          for (let i = 0; i < dayIndices.length; i++) {
            const rowIdx = dayIndices[i];
            const labelY = rowIdx * (scaledCellSize + scaledCellGap) + scaledCellSize / 2;
            const labelX = -(scaledCellGap * 2); // Position to the left with padding
            ctx.fillText(dayLabels[i], labelX, labelY);
          }

          ctx.globalAlpha = heatmapOpacity;
          ctx.restore();
        }

        // Draw Cells
        section.grid.forEach((rowCells, rIdx) => {
          rowCells.forEach((cell, cIdx) => {
            if (!cell) return;

            // Animation for cell
            const heatmapDuration = 4.0 / durationSec; // 4 seconds duration
            const localProgress = (progress - PAUSE_END) / heatmapDuration;
            let show = false;

            if (localProgress > 0) {
              if (config.animationType === 'column') {
                const totalCols = section.grid[0].length;
                const colProgress = cIdx / totalCols;
                if (localProgress >= colProgress) show = true;
              } else if (config.animationType === 'all-at-once') {
                if (localProgress > 0) show = true;
              } else if (config.animationType === 'random') {
                if (cell && cell.date) {
                  const hash = cell.date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                  const seed = hash + rIdx * 137 + cIdx * 99;
                  const randomVal = (Math.sin(seed * 12.9898) + 1) / 2;
                  if (localProgress >= randomVal) show = true;
                }
              } else {
                // Default sequential
                const totalCols = section.grid[0].length;
                const cellProgress = cIdx / totalCols;
                if (localProgress >= cellProgress) show = true;
              }
            }

            if (show) {
              const cx = cIdx * (scaledCellSize + scaledCellGap);
              const cy = rIdx * (scaledCellSize + scaledCellGap);

              // Get color
              const colors = config.colorScheme === 'custom' ? config.customColors : COLOR_PRESETS[config.colorScheme];
              const color = colors[`level${cell.level}`] || colors.level0;

              ctx.fillStyle = color;

              ctx.beginPath();
              const radius = Math.min(scaledCornerRadius, scaledCellSize / 2);
              ctx.roundRect(cx, cy, scaledCellSize, scaledCellSize, radius);
              ctx.fill();
            }
          });
        });

        ctx.restore();
      });

      ctx.restore();
    }

    // Create and encode video frame
    const videoFrame = new VideoFrame(canvas, {
      timestamp,
      duration: 1_000_000 / FRAME_RATE,
    });
    videoEncoder.encode(videoFrame, { keyFrame: frame % 150 === 0 });
    videoFrame.close();

    // Progress logging
    if (frame % 30 === 0 || frame === TOTAL_FRAMES - 1) {
      const percent = Math.round((frame / TOTAL_FRAMES) * 100);
      console.log(`🎬 Encoding progress: ${percent}% (${frame}/${TOTAL_FRAMES} frames)`);
    }
  }

  // Finalize encoding
  console.log('✨ Finalizing video...');
  await videoEncoder.flush();
  await muxer.finalize();
  const buffer = target.buffer;
  console.log(`✅ Video export complete! Size: ${(buffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
  return new Blob([buffer], { type: 'video/mp4' });
}
