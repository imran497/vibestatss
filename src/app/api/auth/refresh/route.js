import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken, generateAccessToken } from '@/app/lib/jwt';
import { getUserById } from '@/app/lib/db-users';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyToken(refreshToken);
    } catch (error) {
      // Clear invalid cookies
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');

      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Check if it's a refresh token
    if (decoded.type !== 'refresh') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserById(decoded.sub);

    if (!user) {
      // User no longer exists
      cookieStore.delete('access_token');
      cookieStore.delete('refresh_token');

      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    // Set new access token cookie
    cookieStore.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      { message: 'Token refreshed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Token refresh failed' },
      { status: 500 }
    );
  }
}
