import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// List of protected routes that require authentication
const protectedRoutes = [
  '/creator',
  '/dashboard',
  '/profile',
  '/settings',
];

// List of auth routes that should redirect to creator if already logged in
const authRoutes = [
  '/login',
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get access token from cookies
  const accessToken = request.cookies.get('access_token')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Verify token if it exists
  let isAuthenticated = false;
  if (accessToken) {
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || process.env.SESSION_SECRET
      );

      await jwtVerify(accessToken, secret, {
        issuer: 'vibestatss',
        audience: 'vibestatss-users',
      });

      isAuthenticated = true;
    } catch (error) {
      // Token is invalid or expired
      isAuthenticated = false;
    }
  }

  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect to creator page if accessing auth routes while authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/creator', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
