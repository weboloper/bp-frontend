// src/lib/api/index.ts
// Export all API modules

export { default as apiClient } from './client';
export { authAPI } from './auth';
export type { LoginCredentials, RegisterData, User } from './auth';
