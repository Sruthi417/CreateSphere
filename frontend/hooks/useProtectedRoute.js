'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Loader2 } from 'lucide-react';

/**
 * useProtectedRoute Hook
 * 
 * Usage: Call at the top of any page that requires authentication
 * 
 * If user is not authenticated:
 * - Waits for auth state to hydrate (from localStorage/persistence)
 * - If still no auth after hydration, redirects to login
 * - Shows loading spinner while checking
 * 
 * If user is authenticated:
 * - Renders the page normally
 */
export function useProtectedRoute() {
  const router = useRouter();
  const { isAuthenticated, authToken } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give auth state time to hydrate from localStorage
    const checkAuth = async () => {
      // Wait a bit for Zustand to hydrate from localStorage
      await new Promise(resolve => setTimeout(resolve, 100));

      const token = localStorage.getItem('authToken');
      if (!token && !authToken) {
        // No token found - redirect to login
        router.push('/auth/login');
      } else {
        // Token found - allow access
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [authToken, router]);

  if (isChecking) {
    return {
      isLoading: true,
      LoadingComponent: (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ),
    };
  }

  return {
    isLoading: false,
    LoadingComponent: null,
  };
}

/**
 * Usage in a protected page:
 * 
 * export default function ProtectedPage() {
 *   const { isLoading, LoadingComponent } = useProtectedRoute();
 *   
 *   if (isLoading) return LoadingComponent;
 *   
 *   return (
 *     <div>Page content</div>
 *   );
 * }
 */
