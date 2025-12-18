import { NextResponse } from 'next/server';
import {
  fetchGitHubContributions,
  transformToGrid,
  getDateRange,
  isValidUsername,
} from '@/app/lib/github-api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const timeRange = searchParams.get('timeRange') || '365';

    // Validate inputs
    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    if (!isValidUsername(username)) {
      return NextResponse.json(
        { error: 'Invalid GitHub username format' },
        { status: 400 }
      );
    }

    // Validate time range
    const validRanges = ['30', '90', '180', '365', 'year'];
    if (!validRanges.includes(timeRange)) {
      return NextResponse.json(
        { error: 'Invalid time range. Must be one of: 30, 90, 180, 365, year' },
        { status: 400 }
      );
    }

    // Check for GitHub token
    if (!process.env.GITHUB_TOKEN) {
      console.error('GITHUB_TOKEN environment variable is not set');
      return NextResponse.json(
        { error: 'GitHub integration is not configured' },
        { status: 500 }
      );
    }

    // Get date range
    const { fromDate, toDate } = getDateRange(timeRange);

    // Fetch from GitHub
    const calendar = await fetchGitHubContributions(username, fromDate, toDate);

    // Transform to grid format
    const gridData = transformToGrid(calendar);

    return NextResponse.json({
      success: true,
      username,
      timeRange,
      ...gridData,
    });
  } catch (error) {
    console.error('GitHub API error:', error);

    // Handle specific errors
    if (error.message === 'USER_NOT_FOUND') {
      return NextResponse.json(
        { error: `GitHub user "${searchParams.get('username')}" not found` },
        { status: 404 }
      );
    }

    if (error.message.includes('rate limit')) {
      return NextResponse.json(
        {
          error:
            'GitHub API rate limit exceeded. Please try again later.',
        },
        { status: 429 }
      );
    }

    if (error.message.includes('API token')) {
      return NextResponse.json(
        { error: 'GitHub authentication failed. Please check API token.' },
        { status: 401 }
      );
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to fetch GitHub contributions. Please try again.' },
      { status: 500 }
    );
  }
}
