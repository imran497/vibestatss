import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Clear authentication cookies
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}

// Also support GET for simple logout links
export async function GET() {
  try {
    const cookieStore = await cookies();

    // Clear authentication cookies
    cookieStore.delete('access_token');
    cookieStore.delete('refresh_token');

    // Redirect to home or login page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?error=logout_failed`);
  }
}
