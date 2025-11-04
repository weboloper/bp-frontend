// src/lib/api/client.ts
// Axios instance for API calls to Django backend

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANT: For cookie-based auth with CORS
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Token'ı HTTPOnly cookie'den otomatik gelir
    // Manuel eklemeye gerek yok
    
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ Response Error:', error.response?.status, error.config?.url);
    
    const originalRequest = error.config as any;
    
    // Handle 401 - Token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Call Next.js refresh endpoint
        await fetch('/api/auth/refresh', { method: 'POST' });
        
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('🔄 Token refresh failed');
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.log('🚫 Forbidden');
          break;
        case 404:
          console.log('🔍 Not found');
          break;
        case 500:
          console.log('💥 Server error');
          break;
      }
    } else if (error.request) {
      console.log('📡 No response from server');
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
