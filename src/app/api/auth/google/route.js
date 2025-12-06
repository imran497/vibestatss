import { NextResponse } from 'next/server';
import { generateState, getGoogleAuthUrl } from '@/app/lib/google-auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Generate state parameter for CSRF protection
    const state = generateState();

    // Store state in cookie (will be verified in callback)
    const cookieStore = await cookies();
    cookieStore.set('google_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    // Get Google OAuth URL
    const authUrl = getGoogleAuthUrl(state);

    // Redirect to Google
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Google authentication' },
      { status: 500 }
    );
  }
}
