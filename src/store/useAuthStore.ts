'use client';

import { create } from 'zustand';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    first_name: string;
    last_name: string;
    birth_date: string;
    bio?: string;
    avatar?: File | null;
  }) => Promise<void>;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setIsLoading: (isLoading) => set({ isLoading }),

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const userData = await authAPI.getMe();
      set({ user: userData, isAuthenticated: true });
    } catch (err: any) {
      // If token expired, try to refresh
      if (err.shouldRefresh || err.status === 401) {
        try {
          await authAPI.refreshToken();
          // Retry getting user data with new token
          const userData = await authAPI.getMe();
          set({ user: userData, isAuthenticated: true });
          return;
        } catch (refreshErr: any) {
          // Refresh failed - clear everything and logout
          console.log('Refresh token expired, logging out');
          set({ user: null, isAuthenticated: false });

          // Clear cookies via logout endpoint
          try {
            await authAPI.logout();
          } catch (logoutErr) {
            console.error('Logout error:', logoutErr);
          }

          // Don't throw error on initial load
          return;
        }
      }

      set({ user: null, isAuthenticated: false });
      // Don't set error on initial load if not authenticated
      console.log('Not authenticated');
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
      set({ user: null, isAuthenticated: false, isLoading: true });
    } catch (err: any) {
      console.error('Logout error:', err);
      throw err;
    }
  },

  updateProfile: async (data) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      set({ user: updatedUser });
    } catch (err: any) {
      console.error('Profile update error:', err);
      throw err;
    }
  },
}));
