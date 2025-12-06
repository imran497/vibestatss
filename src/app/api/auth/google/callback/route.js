import { NextResponse } from 'next/server';
import { getGoogleAccessToken, getGoogleUser } from '@/app/lib/google-auth';
import { cookies } from 'next/headers';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=access_denied`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=missing_parameters`
      );
    }

    // Verify state parameter
    const cookieStore = await cookies();
    const storedState = cookieStore.get('google_state')?.value;

    if (!storedState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=session_expired`
      );
    }

    if (state !== storedState) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/login?error=invalid_state`
      );
    }

    // Exchange code for access token
    console.log('Exchanging code for access token...');
    const tokenData = await getGoogleAccessToken(code);
    console.log('Token received successfully');

    // Get user info from Google
    console.log('Fetching user info from Google...');
    const googleUser = await getGoogleUser(tokenData.access_token);
    console.log('Google user data:', googleUser);

    // Import database functions and JWT utilities
    const { findOrCreateGoogleUser } = await import('@/app/lib/db-users');
    const { generateAccessToken, generateRefreshToken } = await import('@/app/lib/jwt');

    // Find or create user in database
    console.log('Finding or creating user in database...');
    const user = await findOrCreateGoogleUser(googleUser);
    console.log('User created/found:', { id: user.id, email: user.email });

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store access token in httpOnly cookie
    cookieStore.set('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Store refresh token in httpOnly cookie
    cookieStore.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Clean up OAuth cookies
    cookieStore.delete('google_state');

    // Redirect to creator page or dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/creator`);
  } catch (error) {
    console.error('Google callback error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/login?error=authentication_failed`
    );
  }
}
