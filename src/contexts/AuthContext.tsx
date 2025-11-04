'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateProfile: (data: {
    first_name: string;
    last_name: string;
    birth_date: string;
    bio?: string;
    avatar?: File | null;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const userData = await authAPI.getMe();
      setUser(userData);
    } catch (err: any) {
      // If token expired, try to refresh
      if (err.shouldRefresh || err.status === 401) {
        try {
          await authAPI.refreshToken();
          // Retry getting user data with new token
          const userData = await authAPI.getMe();
          setUser(userData);
          return;
        } catch (refreshErr: any) {
          // Refresh failed - clear everything and logout
          console.log('Refresh token expired, logging out');
          setUser(null);

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

      setUser(null);
      // Don't set error on initial load if not authenticated
      console.log('Not authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      setIsLoading(true);
    } catch (err: any) {
      console.error('Logout error:', err);
      throw err;
    }
  };

  const updateProfile = async (data: {
    first_name: string;
    last_name: string;
    birth_date: string;
    bio?: string;
    avatar?: File | null;
  }) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
    } catch (err: any) {
      console.error('Profile update error:', err);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    checkAuth,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
