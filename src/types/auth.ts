// src/types/auth.ts
// Authentication related types

export interface UserProfile {
  first_name: string;
  last_name: string;
  birth_date: string;
  bio: string;
  avatar: string | null;
  updated_at: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_staff: boolean;
  is_verified: boolean;
  has_password: boolean;
  date_joined: string;
  last_login: string | null;
  created_at?: string;
  profile?: UserProfile;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  uid: string;
  token: string;
  new_password1: string;
  new_password2: string;
}
