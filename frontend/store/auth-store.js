import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      authToken: null,
      user: null,
      userRole: null,
      emailVerified: false,
      isBlocked: false,
      isAuthenticated: false,
      creatorProfile: null,
      onboardingStatus: 'none',
      adminToken: null,
      isAdminAuthenticated: false,

      setAuthToken: (token) => {
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('authToken', token);
          } else {
            localStorage.removeItem('authToken');
          }
        }
        set({ authToken: token, isAuthenticated: !!token });
      },

      setUser: (user) => {
        set({
          user,
          emailVerified: user?.emailVerified || false,
          isBlocked: user?.isBlocked || false,
          userRole: user?.role || 'user',
          onboardingStatus: user?.onboardingStatus || 'none',
          creatorProfile: user?.creatorProfile || null,
        });
        if (typeof window !== 'undefined' && user?.role) {
          localStorage.setItem('userRole', user.role);
        }
      },

      setUserRole: (role) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('userRole', role);
        }
        set({ userRole: role });
      },

      setCreatorProfile: (profile) => {
        set({ creatorProfile: profile });
      },

      setAdminToken: (token) => {
        if (typeof window !== 'undefined') {
          if (token) {
            localStorage.setItem('adminToken', token);
          } else {
            localStorage.removeItem('adminToken');
          }
        }
        set({ adminToken: token, isAdminAuthenticated: !!token });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('adminToken');
        }
        set({
          authToken: null,
          user: null,
          userRole: null,
          emailVerified: false,
          isBlocked: false,
          isAuthenticated: false,
          creatorProfile: null,
          onboardingStatus: 'none',
          adminToken: null,
          isAdminAuthenticated: false,
        });
      },

      initializeAuth: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('authToken');
          const role = localStorage.getItem('userRole');
          const adminToken = localStorage.getItem('adminToken');
          set({
            authToken: token,
            isAuthenticated: !!token,
            userRole: role,
            adminToken,
            isAdminAuthenticated: !!adminToken,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        authToken: state.authToken,
        userRole: state.userRole,
        adminToken: state.adminToken,
      }),
    }
  )
);
