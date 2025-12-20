'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Color scheme presets (matching LeftPanel)
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

// GitHub icon SVG component
const GitHubIcon = ({ color }) => (
  <svg viewBox="0 0 16 16" fill={color} style={{ width: '100%', height: '100%' }}>
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
  </svg>
);

export default function VideoBox({ config }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const textRef = useRef(null);

  // Animation Constants
  const PHASE_1_END = 1.5 / 10;
  const PHASE_2_START = 1.5 / 10;
  const PHASE_2_END = 2.5 / 10;
  const PAUSE_END = 4.0 / 10;

  useEffect(() => {
    if (textRef.current) {
      setTextWidth(textRef.current.offsetWidth);
    }
  }, [config.contributionData, config.username, config.textColor]); // Re-measure on changes

  // Random delays removed (using deterministic hash instead)

  // Restart animation on key changes
  useEffect(() => {
    if (!config.contributionData) return;

    setAnimationProgress(0);

    const duration = 10000; // 10 seconds total
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [config.contributionData, config.animationType, config.timeRange, config.font]);

  // Get cell color based on level and color scheme
  const getCellColor = (level) => {
    const colors = config.colorScheme === 'custom'
      ? config.customColors
      : COLOR_PRESETS[config.colorScheme];

    return colors[`level${level}`] || colors.level0;
  };

  // Calculate if a cell should be visible
  // Heatmap starts appearing at 6.5s (0.65 progress)
  const shouldShowCell = (rowIndex, colIndex, filteredGrid) => {
    const heatmapStart = PAUSE_END;
    const heatmapDuration = 0.5; // 5 seconds for full heatmap animation

    if (animationProgress < heatmapStart) return false;

    const localProgress = (animationProgress - heatmapStart) / heatmapDuration;
    const totalCols = filteredGrid[0].length;

    switch (config.animationType) {
      case 'sequential': {
        const cellProgress = colIndex / totalCols;
        return localProgress >= cellProgress;
      }
      case 'column': {
        const colProgress = colIndex / totalCols;
        return localProgress >= colProgress;
      }
      case 'all-at-once': {
        return localProgress > 0;
      }
      case 'random': {
        const cell = filteredGrid[rowIndex][colIndex];
        if (!cell) return false;
        // Deterministic random based on date and position
        const dateStr = cell.date || '';
        const hash = dateStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const seed = hash + rowIndex * 137 + colIndex * 99;
        const randomVal = (Math.sin(seed * 12.9898) + 1) / 2;
        return localProgress >= randomVal;
      }
      default:
        return true;
    }
  };

  if (!config.contributionData) {
    return (
      <div className="w-full mx-auto" style={{ maxWidth: '780px' }}>
        <div
          className="relative overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center p-16"
          style={{
            backgroundColor: config.backgroundColor,
            width: '780px',
            height: '420px',
            maxWidth: '100%',
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

          <div className="text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 opacity-30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: config.textColor }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 0 002 2h2a2 0 002-2zm0 0V9a2 2 0 012-2h2a2 0 012 2v10m-6 0a2 2 0 002 2h2a2 0 002-2m0 0V5a2 2 0 012-2h2a2 0 012 2v14a2 2 0 01-2 2h-2a2 0 01-2-2z"
              />
            </svg>
            <p style={{ color: config.textColor }} className="text-sm opacity-50">
              Enter a GitHub username and click "Fetch Contributions" to preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { grid, username } = config.contributionData;

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

  // Use config values directly (user controlled)
  const cellSize = config.cellSize;
  const cellGap = config.cellGap;

  // Day labels
  const dayLabels = ['Mon', 'Wed', 'Fri'];
  const dayIndices = [1, 3, 5];

  // --- Animation Logic ---
  // Total Duration: 10s
  // Phase 1 (0 - 2.5s): Icon Scale (0-0.5) + Text Reveal (0.5-2.5)
  // Phase 2 (2.5s - 4.5s): Transition to Top + Count Enter
  // Pause (4.5s - 6.5s): Hold
  // Phase 3 (6.5s+): Count Fade Out, Heatmap Fade In

  // Easing
  const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const easeOutElastic = (x) => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };

  // --- Phase 1 Calculations ---
  // Icon Scale: 0 - 0.5s (0 - 0.05 progress)
  const iconScaleDuration = 0.5 / 10;
  const iconScaleProgress = Math.min(animationProgress / iconScaleDuration, 1);
  const iconScale = easeOutElastic(iconScaleProgress);

  // Text Reveal: 0.5s - 1.5s (1s duration)
  const textRevealStart = 0.5 / 10;
  const textRevealDuration = 1.0 / 10;
  const rawTextRevealProgress = Math.min(Math.max((animationProgress - textRevealStart) / textRevealDuration, 0), 1);
  const textRevealProgress = easeInOut(rawTextRevealProgress);

  // --- Phase 2 Calculations ---
  // Transition: 1.5s - 2.5s (1s duration)
  const transitionDuration = 1.0 / 10;
  const rawTransitionProgress = Math.min(Math.max((animationProgress - PHASE_2_START) / transitionDuration, 0), 1);
  const transitionProgress = easeInOut(rawTransitionProgress);

  // Interpolation for Icon/Text Group
  const startIconSize = 120;
  const endIconSize = 32;
  const currentIconSize = startIconSize - ((startIconSize - endIconSize) * transitionProgress);

  const startFontSize = 48;
  const endFontSize = 24;
  const currentFontSize = startFontSize - ((startFontSize - endFontSize) * transitionProgress);

  // Calculate scale ratio for text elements based on font size
  const fontScale = currentFontSize / startFontSize;

  const startY = 0;
  const endY = -146; // Target top position
  const translateY = startY + ((endY - startY) * transitionProgress);

  // Width/Margin Calculation (Interpolated for perfect centering)
  const startPadding = 30;
  const currentPadding = startPadding * fontScale;

  const startMargin = -20;
  const currentMargin = startMargin * fontScale;

  // Interpolate the measured text width
  const currentTextWidth = textWidth * fontScale;
  const fullTextWidth = currentTextWidth + currentPadding;

  // --- Count Animation ---
  // Enter: 1.5s - 2.5s (Same as transition)
  const countTranslateY = 100 * (1 - transitionProgress);

  // Visibility Logic (Hard Cut at 4.0s)
  // Show Count until 4.0s
  const showCount = animationProgress < PAUSE_END && rawTransitionProgress > 0; // Use rawTransitionProgress for phase2 check
  const countOpacity = showCount ? transitionProgress : 0; // Fade in, then hard cut

  // --- Heatmap Animation ---
  // Show Heatmap starting at 4.0s
  const showHeatmap = animationProgress >= PAUSE_END;
  const heatmapOpacity = showHeatmap ? 1 : 0; // Hard cut
  const fullUsername = `@${username || config.username}`;

  return (
    <div className="w-full mx-auto" style={{ maxWidth: '780px' }}>
      <div
        className="relative overflow-hidden rounded-2xl shadow-2xl flex items-center justify-center"
        style={{
          backgroundColor: config.backgroundColor,
          width: '780px',
          height: '420px',
          maxWidth: '100%',
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

        {/* Layer 1: Icon + Username Group (Always Visible) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              y: translateY,
              position: 'absolute',
              left: 0,
              right: 0,
            }}
          >
            {/* GitHub Icon */}
            <motion.div
              style={{
                width: currentIconSize,
                height: currentIconSize,
                zIndex: 10,
                scale: iconScale,
                flexShrink: 0,
              }}
            >
              <GitHubIcon color={config.textColor} />
            </motion.div>

            {/* Username Text */}
            <div
              style={{
                height: currentIconSize,
                display: 'flex',
                alignItems: 'center',
                overflowX: 'hidden',
                overflowY: 'visible', // Allow vertical overflow for tall fonts
                width: textRevealProgress > 0 ? fullTextWidth * textRevealProgress : 0,
              }}
            >
              <motion.div
                style={{
                  overflowX: 'hidden',
                  overflowY: 'visible',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  zIndex: 1,
                  marginLeft: currentMargin,
                  paddingLeft: currentPadding,
                  width: fullTextWidth > 0 ? fullTextWidth : 'auto',
                }}
              >
                <h2
                  ref={textRef}
                  style={{
                    color: config.textColor,
                    fontSize: `${currentFontSize}px`,
                    fontWeight: 'bold',
                    margin: 0,
                    lineHeight: 1.2, // Increased from 1
                    paddingRight: '10px',
                    paddingBottom: '4px', // Add padding for descenders
                    fontFamily: config.font,
                  }}
                >
                  {fullUsername}
                </h2>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Layer 2: Contribution Count */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0, // Cover full area
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            y: countTranslateY, // Relative to center
            opacity: countOpacity,
            textAlign: 'center',
            marginTop: 0,
            pointerEvents: 'none', // Allow clicking through
          }}
        >
          <h3
            style={{
              color: config.textColor,
              fontSize: '48px',
              fontWeight: 'bold',
              margin: 0,
              fontFamily: `${config.font}, sans-serif`,
            }}
          >
            {filteredTotal} Contributions
          </h3>
          <p
            style={{
              color: config.textColor,
              fontSize: '24px',
              margin: '5px 0 0 0',
              opacity: 0.8,
              fontFamily: `${config.font}, sans-serif`,
            }}
          >
            {(() => {
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
            })()}
          </p>
        </motion.div>

        {/* Layer 3: Heatmap Grid */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: heatmapOpacity,
            paddingTop: '80px', // Space for icon/username at top
            paddingBottom: '20px'
          }}
        >
          <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${layout.cols}, auto)`, justifyContent: 'center' }}>
            {monthSections.map((monthSection, sectionIdx) => {
              const { monthName, grid: monthGrid } = monthSection;
              const isFirstColumn = sectionIdx % layout.cols === 0;
              const weeksInMonth = monthGrid[0].length;

              // Calculate exact grid width to enforce centering on grid
              const gridWidth = weeksInMonth * cellSize + (weeksInMonth - 1) * cellGap;

              return (
                <div key={sectionIdx} className="flex flex-col items-center">
                  {/* Month label - centered above grid */}
                  {config.showMonthLabels && (
                    <div className="mb-3" style={{ marginBottom: `${cellGap * 2}px` }}>
                      <p
                        style={{
                          color: config.textColor,
                          fontSize: `${Math.max(cellSize * 0.8, 8)}px`,
                          whiteSpace: 'nowrap',
                        }}
                        className="opacity-60 font-medium"
                      >
                        {monthName}
                      </p>
                    </div>
                  )}

                  {/* Grid container - width determined by cells only */}
                  <div style={{ position: 'relative', width: gridWidth }}>
                    {/* Day labels - positioned absolutely to the left of grid */}
                    {config.showDayLabels && isFirstColumn && (
                      <div
                        className="flex flex-col justify-start"
                        style={{
                          position: 'absolute',
                          right: '100%',
                          top: 0,
                          gap: cellGap,
                          paddingRight: `${cellGap * 2}px`,
                        }}
                      >
                        {monthGrid.map((_, rowIndex) => (
                          <div
                            key={rowIndex}
                            style={{
                              width: `${Math.max(cellSize * 2, 16)}px`,
                              height: cellSize,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              paddingRight: `${cellGap}px`,
                            }}
                          >
                            {dayIndices.includes(rowIndex) && (
                              <span
                                style={{
                                  color: config.textColor,
                                  fontSize: `${Math.max(cellSize * 0.7, 7)}px`,
                                }}
                                className="opacity-50"
                              >
                                {dayLabels[dayIndices.indexOf(rowIndex)]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Heatmap cells */}
                    <div className="flex" style={{ gap: cellGap }}>
                      {Array.from({ length: weeksInMonth }).map((_, weekIdx) => {
                        return (
                          <div key={weekIdx} className="flex flex-col" style={{ gap: cellGap }}>
                            {monthGrid.map((row, rowIndex) => {
                              const cell = row[weekIdx];

                              // Skip if cell doesn't exist (incomplete weeks)
                              if (!cell) {
                                return (
                                  <div
                                    key={`${rowIndex}-${weekIdx}`}
                                    style={{
                                      width: cellSize,
                                      height: cellSize,
                                    }}
                                  />
                                );
                              }

                              const show = shouldShowCell(rowIndex, weekIdx, monthGrid);

                              return (
                                <motion.div
                                  key={`${rowIndex}-${weekIdx}`}
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={show ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                                  transition={{
                                    duration: 0.3,
                                    ease: [0.4, 0, 0.2, 1],
                                  }}
                                  style={{
                                    width: cellSize,
                                    height: cellSize,
                                    borderRadius: config.cornerRadius,
                                    backgroundColor: getCellColor(cell.level),
                                  }}
                                  title={`${cell.date}: ${cell.count} contributions`}
                                />
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
