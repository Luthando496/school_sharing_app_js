import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Create the Zustand store with the persist middleware
export const useUserStore = create()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      isLoggedIn: false,

      // Action to log in a user
      login: (userData) => {
        set({
          user: userData,
          isLoggedIn: true,
        });
      },

      // Action to log out a user
      logout: () => {
        set({
          user: null,
          isLoggedIn: false,
        });
      },
    }),
    {
      name: 'user-storage', // unique name for the storage key
      storage: createJSONStorage(() => localStorage), // use localStorage as the storage medium
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }), // only persist the user and isLoggedIn fields
    }
  )
);