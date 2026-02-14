import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      sidebarOpen: true,
      mobileMenuOpen: false,

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (value) => set({ sidebarOpen: value }),
      toggleMobileMenu: () => set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
      setMobileMenuOpen: (value) => set({ mobileMenuOpen: value }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ sidebarOpen: state.sidebarOpen }),
    }
  )
);
