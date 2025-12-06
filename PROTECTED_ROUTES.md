# Protected Routes Configuration

The creator page and other protected routes now require authentication.

## Overview

The middleware automatically protects specific routes and redirects unauthenticated users to the login page.

## Protected Routes

These routes require authentication:
- ✅ `/creator` - Creator studio (all sub-routes)
- ✅ `/dashboard` - User dashboard
- ✅ `/profile` - User profile
- ✅ `/settings` - User settings

## Authentication Flow

### For Unauthenticated Users

1. User tries to access `/creator`
2. Middleware checks for `access_token` cookie
3. No token found → Redirect to `/login?redirect=/creator`
4. User logs in via Twitter OAuth
5. After login → Redirect back to `/creator`

### For Authenticated Users

1. User tries to access `/creator`
2. Middleware verifies JWT token
3. Token valid → Allow access
4. Token invalid/expired → Redirect to `/login`

### Login Page Behavior

If user is already logged in and tries to access `/login`:
- Automatically redirects to `/creator`
- Prevents logged-in users from seeing login page

## How It Works

### Middleware Location

File: `src/middleware.js` (moved from `src/app/middleware.js`)

**Note:** In Next.js app directory, middleware must be at:
- ✅ `src/middleware.js` (correct)
- ❌ `src/app/middleware.js` (won't work)

### Protected Route Check

```javascript
const protectedRoutes = [
  '/creator',
  '/dashboard',
  '/profile',
  '/settings',
];

const isProtectedRoute = protectedRoutes.some(route =>
  pathname.startsWith(route)
);
```

### Token Verification

```javascript
const accessToken = request.cookies.get('access_token')?.value;

if (accessToken) {
  try {
    verifyToken(accessToken); // JWT verification
    isAuthenticated = true;
  } catch (error) {
    isAuthenticated = false;
  }
}
```

### Redirect Logic

```javascript
// Protect routes
if (isProtectedRoute && !isAuthenticated) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

// Redirect logged-in users away from login
if (isAuthRoute && isAuthenticated) {
  return NextResponse.redirect(new URL('/creator', request.url));
}
```

## Matcher Configuration

The middleware runs on all routes except:
- `_next/static` - Static files
- `_next/image` - Image optimization
- `favicon.ico` - Favicon
- Files with extensions (`.png`, `.jpg`, etc.)
- `/api/*` - API routes (handled separately)

```javascript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
```

## Adding New Protected Routes

To protect additional routes, add them to the `protectedRoutes` array:

```javascript
const protectedRoutes = [
  '/creator',
  '/dashboard',
  '/profile',
  '/settings',
  '/my-new-route', // Add here
];
```

## Testing Protection

### Test Unauthenticated Access

1. **Clear cookies** (or use incognito mode)
2. **Visit** http://localhost:3000/creator
3. **Expected:** Redirect to `/login?redirect=/creator`

### Test Authenticated Access

1. **Login** via `/login` with Twitter
2. **Visit** http://localhost:3000/creator
3. **Expected:** Access granted, page loads

### Test Login Redirect

1. **Already logged in**
2. **Visit** http://localhost:3000/login
3. **Expected:** Redirect to `/creator`

### Test Redirect After Login

1. **Not logged in**
2. **Visit** http://localhost:3000/creator
3. **Redirected to** `/login?redirect=/creator`
4. **Login** with Twitter
5. **Expected:** Redirected back to `/creator`

## Error Handling

### Expired Token

- Middleware catches `TokenExpiredError`
- Treats user as unauthenticated
- Redirects to login
- User can log in again to get new token

### Invalid Token

- Middleware catches `JsonWebTokenError`
- Treats user as unauthenticated
- Redirects to login

### No Token

- User treated as unauthenticated
- Redirects to login for protected routes

## Security Features

- ✅ **Server-side protection** - Runs before page loads
- ✅ **JWT verification** - Cryptographically verifies tokens
- ✅ **httpOnly cookies** - Tokens not accessible via JavaScript
- ✅ **Automatic redirects** - Seamless user experience
- ✅ **Redirect preservation** - Returns to original page after login

## Common Issues

### "Middleware not running"
- ✅ **Fixed:** Moved to `src/middleware.js`
- Middleware must be at root of `src/` folder

### "Still can access creator page without login"
- Check browser cookies (may have old session)
- Clear cookies and try again
- Verify middleware file is in correct location

### "Redirect loop"
- Check token verification logic
- Ensure JWT_SECRET is set in `.env.local`
- Clear cookies and try fresh login

## Build Output

When middleware is active, you'll see this in build output:

```
ƒ Proxy (Middleware)

Route (app)
├ ○ /creator        ← Protected by middleware
├ ○ /login          ← Handled by middleware
└ ...
```

## Future Enhancements

Potential additions:
- [ ] Role-based access control (RBAC)
- [ ] Route-specific permissions
- [ ] Rate limiting
- [ ] Geo-blocking
- [ ] Device verification
- [ ] Session management
- [ ] Token refresh in middleware

## Next.js 16 Note

⚠️ Next.js 16 shows deprecation warning:
```
The "middleware" file convention is deprecated.
Please use "proxy" instead.
```

This is just a warning. The middleware still works. Future Next.js versions may require migration to the new "proxy" convention.
