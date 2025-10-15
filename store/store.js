import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      // --- Existing State ---
      user: null,
      isLoggedIn: false,
      
      // --- New State ---
      notificationCount: 0,

      // --- Existing Actions ---
      login: (userData) => {
        set({
          user: userData,
          isLoggedIn: true,
        });
      },
      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
          notificationCount: 0, // Reset count on logout
        });
      },
      
      // --- New Action ---
      setNotificationCount: (count) => {
        set({ notificationCount: count });
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      // We only persist user info, not the real-time notification count
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);