'use client';

import { useState, useEffect } from 'react';

/**
 * Client-side hook to get current user information
 * Fetches from /api/auth/me endpoint
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setError(null);
        // Store user in localStorage for faster auth checks
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } else if (response.status === 401) {
        // Not authenticated
        setUser(null);
        setError(null);
        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
      } else {
        throw new Error('Failed to fetch user');
      }
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message);
      setUser(null);
      // Clear localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setUser(null);
      // Clear localStorage on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      window.location.href = '/login';
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchUser();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Token refresh error:', err);
      return false;
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    refreshToken,
    refetch: fetchUser,
  };
}
