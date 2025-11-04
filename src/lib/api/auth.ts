// src/lib/api/auth.ts
// Authentication API calls - Uses Next.js API Routes for HTTPOnly cookie management

import type { User } from '@/types';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password1: string;
  password2: string;
}

export const authAPI = {
  // Login - Uses Next.js API Route (sets HTTPOnly cookie)
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON (e.g., 500 error with HTML)
        const error: any = new Error('Server error. Please try again later.');
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        // Throw error with field-specific errors attached
        const error: any = new Error(
          data.error ||
          data.detail ||
          data.non_field_errors?.[0] ||
          'Login failed'
        );
        Object.assign(error, data); // Include all field-specific errors
        throw error;
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  // Register - Uses Next.js API Route
  register: async (registerData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON (e.g., 500 error with HTML)
        const error: any = new Error('Server error. Please try again later.');
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        // Throw error with field-specific errors attached
        const error: any = new Error(data.error || data.detail || 'Registration failed');
        Object.assign(error, data); // Include all field-specific errors
        throw error;
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  // Logout - Uses Next.js API Route (deletes HTTPOnly cookie)
  logout: async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Logout failed');
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  // Get current user - Uses Next.js API Route (reads HTTPOnly cookie)
  getMe: async (): Promise<User> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        // Attach metadata for error handling
        const error: any = new Error(data.error || 'Failed to fetch user');
        error.status = response.status;
        error.shouldRefresh = data.shouldRefresh;
        Object.assign(error, data);
        throw error;
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  // Refresh token - Uses Next.js API Route
  refreshToken: async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  // Request password reset - Uses Next.js API Route
  requestPasswordReset: async (email: string) => {
    try {
      const response = await fetch('/api/auth/password-reset-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON (e.g., 500 error with HTML)
        const error: any = new Error('Server error. Please try again later.');
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        // Throw error with field-specific errors attached
        const error: any = new Error(data.error || data.detail || 'Password reset request failed');
        Object.assign(error, data); // Include all field-specific errors
        throw error;
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  // Confirm password reset - Uses Next.js API Route
  confirmPasswordReset: async (uid: string, token: string, password1: string, password2: string) => {
    try {
      const response = await fetch(`/api/auth/password-reset-confirm/${uid}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password1, password2 }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON (e.g., 500 error with HTML)
        const error: any = new Error('Server error. Please try again later.');
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        // Throw error with field-specific errors attached
        const error: any = new Error(data.error || data.detail || 'Password reset confirmation failed');
        Object.assign(error, data); // Include all field-specific errors
        throw error;
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  // Request email verify - Uses Next.js API Route
  requestEmailVerification: async (email: string) => {
    try {
      const response = await fetch('/api/auth/email-verification-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON (e.g., 500 error with HTML)
        const error: any = new Error('Server error. Please try again later.');
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        // Throw error with field-specific errors attached
        const error: any = new Error(data.error || data.detail || 'Email verification request failed');
        Object.assign(error, data); // Include all field-specific errors
        throw error;
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  // Confirm email verify - Uses Next.js API Route
  confirmEmailVerify: async (uid: string, token: string) => {
    try {
      const response = await fetch(`/api/auth/email-verification-confirm/${uid}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON (e.g., 500 error with HTML)
        const error: any = new Error('Server error. Please try again later.');
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        // Throw error with field-specific errors attached
        const error: any = new Error(data.error || data.detail || 'Email verification failed');
        Object.assign(error, data); // Include all field-specific errors
        throw error;
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

  // Update profile - Uses Next.js API Route
  updateProfile: async (profileData: {
    first_name: string;
    last_name: string;
    birth_date: string;
    bio?: string;
    avatar?: File | null;
  }) => {
    try {
      const formData = new FormData();
      formData.append('first_name', profileData.first_name);
      formData.append('last_name', profileData.last_name);
      formData.append('birth_date', profileData.birth_date);
      if (profileData.bio) {
        formData.append('bio', profileData.bio);
      }
      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar);
      }

      const response = await fetch('/api/auth/me', {
        method: 'PATCH',
        body: formData, // Don't set Content-Type, browser will set it with boundary
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON (e.g., 500 error with HTML)
        const error: any = new Error('Server error. Please try again later.');
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        // Throw error with field-specific errors attached
        const error: any = new Error(data.error || data.detail || 'Profile update failed');
        Object.assign(error, data); // Include all field-specific errors
        throw error;
      }

      return data;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        const networkError: any = new Error('Unable to connect to server');
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw error;
    }
  },

};
