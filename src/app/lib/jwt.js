import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET;
const JWT_EXPIRES_IN = '7d'; // 7 days
const REFRESH_TOKEN_EXPIRES_IN = '30d'; // 30 days

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET or SESSION_SECRET must be defined in environment variables');
}

/**
 * Generate an access token for a user
 * @param {Object} user - User object from database
 * @returns {string} JWT token
 */
export function generateAccessToken(user) {
  const payload = {
    sub: user.id, // Subject (user ID)
    email: user.email,
    name: user.name,
    profile_image: user.profile_image_url,
    type: 'access',
  };

  // Add optional fields if they exist
  if (user.twitter_id) payload.twitter_id = user.twitter_id;
  if (user.username) payload.username = user.username;
  if (user.google_id) payload.google_id = user.google_id;

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'vibestatss',
    audience: 'vibestatss-users',
  });
}

/**
 * Generate a refresh token for a user
 * @param {Object} user - User object from database
 * @returns {string} JWT refresh token
 */
export function generateRefreshToken(user) {
  const payload = {
    sub: user.id,
    type: 'refresh',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'vibestatss',
    audience: 'vibestatss-users',
  });
}

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'vibestatss',
      audience: 'vibestatss-users',
    });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Decode token without verifying (useful for getting expired token data)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function decodeToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Check if a token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} True if expired, false otherwise
 */
export function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTime;
}

/**
 * Get user data from token
 * @param {string} token - JWT token
 * @returns {Object|null} User data or null if invalid
 */
export function getUserFromToken(token) {
  try {
    const decoded = verifyToken(token);
    const user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      profile_image: decoded.profile_image,
    };

    // Add optional fields if they exist
    if (decoded.twitter_id) user.twitter_id = decoded.twitter_id;
    if (decoded.username) user.username = decoded.username;
    if (decoded.google_id) user.google_id = decoded.google_id;

    return user;
  } catch (error) {
    return null;
  }
}
