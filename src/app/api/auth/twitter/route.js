import { NextResponse } from 'next/server';
import { generateCodeVerifier, generateCodeChallenge, generateState, getTwitterAuthUrl } from '@/app/lib/twitter-auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const state = generateState();

    // Store code verifier and state in cookies (will be used in callback)
    const cookieStore = await cookies();
    cookieStore.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    cookieStore.set('twitter_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    // Get Twitter OAuth URL
    const authUrl = getTwitterAuthUrl(codeChallenge, state);

    // Redirect to Twitter
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Twitter authentication' },
      { status: 500 }
    );
  }
}
