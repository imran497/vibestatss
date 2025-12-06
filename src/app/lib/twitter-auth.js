import crypto from 'crypto';

// Generate code verifier for PKCE
export function generateCodeVerifier() {
  return crypto.randomBytes(32).toString('base64url');
}

// Generate code challenge from verifier
export function generateCodeChallenge(verifier) {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
}

// Generate random state parameter
export function generateState() {
  return crypto.randomBytes(32).toString('hex');
}

// Get Twitter OAuth authorization URL
export function getTwitterAuthUrl(codeChallenge, state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
    scope: 'tweet.read users.read offline.access',
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `https://twitter.com/i/oauth2/authorize?${params.toString()}`;
}

// Exchange authorization code for access token
export async function getTwitterAccessToken(code, codeVerifier) {
  const params = new URLSearchParams({
    code,
    grant_type: 'authorization_code',
    client_id: process.env.TWITTER_CLIENT_ID,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }

  return response.json();
}

// Get Twitter user info
export async function getTwitterUser(accessToken) {
  // Note: Twitter API v2 does not include email in the /users/me endpoint
  // Email requires a separate verified credentials endpoint which needs additional app verification
  const response = await fetch(
    'https://api.twitter.com/2/users/me?user.fields=profile_image_url,username,name,description,verified',
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${error}`);
  }

  return response.json();
}
