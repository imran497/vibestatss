/**
 * GitHub API integration for fetching contribution data
 * Uses GitHub GraphQL API to get contribution calendar
 */

/**
 * Fetch GitHub contribution data using GraphQL API
 * @param {string} username - GitHub username
 * @param {string} fromDate - ISO date string (start date)
 * @param {string} toDate - ISO date string (end date)
 * @returns {Promise<Object>} Contribution calendar data
 */
export async function fetchGitHubContributions(username, fromDate, toDate) {
  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    username,
    from: fromDate,
    to: toDate,
  };

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data.errors) {
    const error = data.errors[0];
    if (error.type === 'NOT_FOUND') {
      throw new Error('USER_NOT_FOUND');
    }
    throw new Error(error.message);
  }

  if (!data.data || !data.data.user) {
    throw new Error('USER_NOT_FOUND');
  }

  return data.data.user.contributionsCollection.contributionCalendar;
}

/**
 * Transform GitHub API data to grid format
 * @param {Object} calendar - Raw calendar data from GitHub
 * @returns {Object} Grid data with 7 rows (days) x N columns (weeks)
 */
export function transformToGrid(calendar) {
  const { weeks, totalContributions } = calendar;

  // Create 7-row grid (Sun-Sat)
  const grid = [];
  for (let day = 0; day < 7; day++) {
    grid.push([]);
  }

  // Track months for labels
  const months = [];
  let currentMonth = null;

  // Populate grid from weeks
  weeks.forEach((week, weekIndex) => {
    week.contributionDays.forEach((day, dayIndex) => {
      // Add cell to grid
      grid[dayIndex].push({
        date: day.date,
        count: day.contributionCount,
        level: getLevelNumber(day.contributionLevel),
      });

      // Track month changes for labels
      if (dayIndex === 0) {
        // Check Sunday of each week
        const date = new Date(day.date);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;

        if (monthKey !== currentMonth) {
          months.push({
            name: monthName,
            weekIndex,
          });
          currentMonth = monthKey;
        }
      }
    });
  });

  return {
    grid, // 7 x N array
    months, // Array of { name, weekIndex }
    totalContributions,
    startDate: weeks[0]?.contributionDays[0]?.date || null,
    endDate: weeks[weeks.length - 1]?.contributionDays[6]?.date || null,
    weekCount: weeks.length,
  };
}

/**
 * Convert GitHub contribution level to numeric level (0-4)
 * @param {string} level - GitHub contribution level
 * @returns {number} Numeric level 0-4
 */
function getLevelNumber(level) {
  const levelMap = {
    NONE: 0,
    FIRST_QUARTILE: 1,
    SECOND_QUARTILE: 2,
    THIRD_QUARTILE: 3,
    FOURTH_QUARTILE: 4,
  };
  return levelMap[level] || 0;
}

/**
 * Calculate date range based on timeRange option
 * @param {string} timeRange - '30', '90', '180', '365', or 'year'
 * @returns {Object} { fromDate, toDate } in ISO format
 */
export function getDateRange(timeRange) {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  const toDate = today.toISOString();
  let fromDate;

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  switch (timeRange) {
    case '30': {
      const date = new Date(startOfDay);
      date.setDate(date.getDate() - 29); // Last 30 days including today
      fromDate = date.toISOString();
      break;
    }
    case '90': {
      const date = new Date(startOfDay);
      date.setDate(date.getDate() - 89);
      fromDate = date.toISOString();
      break;
    }
    case '180': {
      const date = new Date(startOfDay);
      date.setDate(date.getDate() - 179);
      fromDate = date.toISOString();
      break;
    }
    case '365': {
      const date = new Date(startOfDay);
      date.setDate(date.getDate() - 364);
      fromDate = date.toISOString();
      break;
    }
    case 'year': {
      const date = new Date(today.getFullYear(), 0, 1, 0, 0, 0, 0);
      fromDate = date.toISOString();
      break;
    }
    default: {
      // Default to last 365 days
      const date = new Date(startOfDay);
      date.setDate(date.getDate() - 364);
      fromDate = date.toISOString();
    }
  }

  return { fromDate, toDate };
}

/**
 * Validate GitHub username format
 * @param {string} username - GitHub username to validate
 * @returns {boolean} True if valid
 */
export function isValidUsername(username) {
  // GitHub username rules:
  // - May only contain alphanumeric characters or single hyphens
  // - Cannot begin or end with a hyphen
  // - Maximum 39 characters
  const regex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
  return regex.test(username);
}
