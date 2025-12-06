import { cookies } from 'next/headers';
import { verifyToken, getUserFromToken } from './jwt';
import { getUserById } from './db-users';

/**
 * Get the current authenticated user from the request
 * @returns {Promise<Object|null>} User object or null if not authenticated
 */
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return null;
    }

    // Verify and get user data from token
    const userData = getUserFromToken(accessToken);

    if (!userData) {
      return null;
    }

    return userData;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the full user object from database for the current authenticated user
 * @returns {Promise<Object|null>} Full user object from database or null
 */
export async function getCurrentUserFromDB() {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return null;
    }

    // Fetch full user data from database
    const dbUser = await getUserById(user.id);
    return dbUser;
  } catch (error) {
    console.error('Error getting user from database:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Require authentication - throws error if not authenticated
 * @returns {Promise<Object>} User object
 * @throws {Error} If not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Authentication required');
  }

  return user;
}
