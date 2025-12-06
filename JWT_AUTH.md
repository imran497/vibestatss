# JWT Authentication Guide

This project uses JWT (JSON Web Tokens) for secure, stateless authentication.

## Overview

### What Changed from Cookie Sessions

- ✅ **Before**: Plain JSON data stored in cookies
- ✅ **Now**: Signed JWT tokens stored in httpOnly cookies
- ✅ **Security**: Tokens are cryptographically signed and verified
- ✅ **Stateless**: No server-side session storage needed

## Architecture

### Token Types

1. **Access Token** (7 days)
   - Used for API authentication
   - Contains user data (id, username, name, profile_image)
   - Stored in httpOnly cookie: `access_token`

2. **Refresh Token** (30 days)
   - Used to generate new access tokens
   - Contains minimal data (just user ID)
   - Stored in httpOnly cookie: `refresh_token`

### Token Payload

Access tokens include:
```json
{
  "sub": "user-uuid",           // Subject (user ID)
  "twitter_id": "123456789",
  "username": "johndoe",
  "name": "John Doe",
  "profile_image": "https://...",
  "type": "access",
  "iss": "vibestatss",          // Issuer
  "aud": "vibestatss-users",    // Audience
  "exp": 1234567890,            // Expiration timestamp
  "iat": 1234567890             // Issued at timestamp
}
```

## Environment Variables

Add to your `.env.local`:

```env
# Use existing SESSION_SECRET or generate new JWT_SECRET
JWT_SECRET=your_secret_key_here
# Or keep using:
SESSION_SECRET=your_random_secret_key_here
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API Endpoints

### Authentication Flow

1. **Login**: `/api/auth/twitter` → Redirects to Twitter OAuth
2. **Callback**: `/api/auth/twitter/callback` → Issues JWT tokens
3. **Get Current User**: `GET /api/auth/me` → Returns user info
4. **Refresh Token**: `POST /api/auth/refresh` → Get new access token
5. **Logout**: `POST /api/auth/logout` or `GET /api/auth/logout`

## Usage Examples

### Server-Side (API Routes)

```javascript
import { getCurrentUser, requireAuth } from '@/app/lib/auth';

// Option 1: Get user (returns null if not authenticated)
export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Use user data...
}

// Option 2: Require auth (throws error if not authenticated)
export async function GET() {
  try {
    const user = await requireAuth();
    // User is guaranteed to exist here
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
```

### Server-Side (Server Components)

```javascript
import { getCurrentUser } from '@/app/lib/auth';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>@{user.username}</p>
    </div>
  );
}
```

### Client-Side (React Components)

```javascript
'use client';

import { useAuth } from '@/app/hooks/useAuth';

export default function ProfileComponent() {
  const { user, loading, isAuthenticated, logout } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## Protected Routes

The middleware automatically protects routes defined in `src/app/middleware.js`:

- `/creator` - Requires authentication
- `/dashboard` - Requires authentication
- `/profile` - Requires authentication
- `/settings` - Requires authentication

Users trying to access these routes without authentication will be redirected to `/login`.

## Token Refresh Flow

Access tokens expire after 7 days. The refresh flow:

1. Client detects expired access token (401 response)
2. Client calls `POST /api/auth/refresh`
3. Server verifies refresh token
4. Server generates new access token
5. Client retries original request

Example:
```javascript
const { refreshToken } = useAuth();

// Manually refresh token
const success = await refreshToken();
```

## Security Features

- ✅ **httpOnly cookies**: Tokens not accessible via JavaScript (XSS protection)
- ✅ **Signed tokens**: Tamper-proof with secret key
- ✅ **Short expiration**: Access tokens expire in 7 days
- ✅ **Refresh tokens**: Separate long-lived tokens for renewal
- ✅ **HTTPS only in production**: Secure cookie flag
- ✅ **SameSite protection**: CSRF attack prevention

## Migration from Old Cookie System

All existing code automatically works with the new JWT system because:

1. Tokens are still stored in cookies (just signed now)
2. Same helper functions (`getCurrentUser`, etc.)
3. Middleware handles verification transparently

### What You Need to Update

Nothing! The migration is backward compatible. However, you can:

- Use the new `useAuth()` hook in client components
- Add protected routes to middleware
- Implement token refresh for long-lived sessions

## Debugging

### Check if user is authenticated

```bash
# Server-side
curl http://localhost:3000/api/auth/me \
  -H "Cookie: access_token=your_token_here"

# Or use browser DevTools → Application → Cookies
```

### Verify token manually

```javascript
import { verifyToken, decodeToken } from '@/app/lib/jwt';

// Decode without verification (see contents)
const decoded = decodeToken(token);
console.log(decoded);

// Verify (throws error if invalid)
try {
  const verified = verifyToken(token);
  console.log('Token is valid:', verified);
} catch (error) {
  console.error('Token is invalid:', error.message);
}
```

## Common Issues

### "JWT_SECRET must be defined"
- Add `JWT_SECRET` or `SESSION_SECRET` to `.env.local`

### "Token has expired"
- Access token expired - use refresh endpoint
- Or log in again

### "Invalid token"
- Token was tampered with
- Secret key changed
- Clear cookies and log in again

## Next Steps

- [ ] Implement auto token refresh in client
- [ ] Add token blacklist for logout
- [ ] Add "remember me" functionality
- [ ] Implement role-based access control (RBAC)
- [ ] Add OAuth scope management
