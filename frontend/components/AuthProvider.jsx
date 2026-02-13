'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { authAPI, userAPI } from '@/lib/api-client';

/**
 * AuthProvider Component
 * 
 * Runs on app load to:
 * 1. Check if token exists in localStorage
 * 2. If token exists, restore auth state
 * 3. Fetch current user profile if needed
 * 4. Restore user data in auth store
 * 
 * This enables persistent login - users stay logged in
 * after page refresh until token expires (7 days by default)
 */
export default function AuthProvider({ children }) {
  const { setAuthToken, setUser, setUserRole, setCreatorProfile, authToken } = useAuthStore();

  useEffect(() => {
    const restoreAuthState = async () => {
      // Check if running in browser
      if (typeof window === 'undefined') return;

      // Try to get token from localStorage
      const storedToken = localStorage.getItem('authToken');
      
      // If no token stored, nothing to restore
      if (!storedToken) {
        return;
      }

      try {
        // Token exists but auth state might not be hydrated yet
        // Set the token to restore basic auth state
        setAuthToken(storedToken);

        // Try to fetch current user profile
        // This validates the token and gets fresh user data
        const profileResponse = await userAPI.getProfile();
        
        if (profileResponse.data?.data) {
          const user = profileResponse.data.data;
          
          // Restore full user state
          setUser(user);
          setUserRole(user.role);
          
          if (user.creatorProfile) {
            setCreatorProfile(user.creatorProfile);
          }
        }
      } catch (error) {
        // Token might be expired or invalid
        // Clear invalid token
        console.log('Auth restoration failed:', error.message);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        
        // Reset auth state
        setAuthToken(null);
      }
    };

    // Run on component mount (app load)
    restoreAuthState();
  }, []); // Only run once on app mount

  return children;
}
