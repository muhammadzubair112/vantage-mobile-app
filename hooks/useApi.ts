/// <reference types="node" />

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

declare const __DEV__: boolean;

// API URL - using local server until deployment
const API_URL = Platform.select({
  ios: 'http://192.168.86.249:5001/api',
  android: 'http://192.168.86.249:5001/api',
  default: 'http://192.168.86.249:5001/api',
});

// Log the API URL for debugging
if (__DEV__) {
  console.log('API Configuration:', {
    url: API_URL,
    platform: Platform.OS,
    environment: 'development'
  });
}

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requiresAuth?: boolean;
  retries?: number;
  timeout?: number;
  params?: Record<string, any>;
}

interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
}

export const useApi = () => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveToken = useCallback(async (newToken: string) => {
    try {
      await AsyncStorage.setItem('auth_token', newToken);
      setToken(newToken);
      setError(null);
    } catch (error) {
      console.error('Error saving token:', error);
      throw new Error('Failed to save authentication token');
    }
  }, []);

  const clearToken = useCallback(async () => {
    try {
      await AsyncStorage.removeItem('auth_token');
      setToken(null);
      setError(null);
    } catch (error) {
      console.error('Error clearing token:', error);
      throw new Error('Failed to clear authentication token');
    }
  }, []);

  const handleApiError = useCallback((error: any, endpoint: string): ApiError => {
    if (__DEV__) {
      console.error('API Error:', {
        endpoint,
        error: {
          name: error.name,
          message: error.message,
          status: error.status,
          code: error.code,
          data: error.data
        }
      });
    }

    const apiError = new Error() as ApiError;
    
    if (error.name === 'AbortError') {
      apiError.message = 'Request timed out. Please try again.';
      apiError.code = 'TIMEOUT';
      return apiError;
    }

    if (!error.status && error.message.includes('Network request failed')) {
      apiError.message = 'Unable to connect to the server. Please check your internet connection and try again.';
      apiError.code = 'NETWORK_ERROR';
      return apiError;
    }

    if (error.status === 401) {
      apiError.message = 'Your session has expired. Please log in again.';
      apiError.status = 401;
      clearToken(); // Auto clear token on 401
      return apiError;
    }

    if (error.status === 403) {
      apiError.message = 'You do not have permission to perform this action.';
      apiError.status = 403;
      return apiError;
    }

    if (error.status === 404) {
      apiError.message = 'The requested resource was not found.';
      apiError.status = 404;
      return apiError;
    }

    if (error.status === 429) {
      apiError.message = 'Too many requests. Please try again later.';
      apiError.status = 429;
      return apiError;
    }

    if (error.status >= 500) {
      apiError.message = 'An unexpected server error occurred. Please try again later.';
      apiError.status = error.status;
      return apiError;
    }

    apiError.message = error.data?.error || error.message || 'An unexpected error occurred. Please try again.';
    apiError.status = error.status;
    apiError.code = error.code;
    apiError.data = error.data;
    
    return apiError;
  }, [clearToken]);

  const apiCall = useCallback(async (endpoint: string, options: ApiOptions = {}) => {
    const {
      method = 'GET',
      body,
      requiresAuth = true,
      retries = 3,
      timeout = 10000, // 10 second timeout
      params
    } = options;

    setIsLoading(true);
    setError(null);

    // If we need auth and don't have a token, try to load it
    if (requiresAuth && !token) {
      const storedToken = await AsyncStorage.getItem('auth_token');
      if (storedToken) {
        setToken(storedToken);
      }
    }

    let attempt = 0;
    let lastError: ApiError | null = null;

    while (attempt < retries) {
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        };

        // Add token to headers if we have one
        const currentToken = token || await AsyncStorage.getItem('auth_token');
        if (currentToken) {
          headers['Authorization'] = `Bearer ${currentToken}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Handle query parameters
        const url = new URL(`${API_URL}${endpoint}`);
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
          });
        }

        const config: RequestInit = {
          method,
          headers,
          credentials: 'include',
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal
        };

        if (__DEV__) {
          console.log(`API Request:`, {
            url: url.toString(),
            method,
            headers: { ...headers, Authorization: currentToken ? 'Bearer [HIDDEN]' : undefined },
            body: body ? '[HIDDEN]' : undefined,
            attempt: attempt + 1,
            maxRetries: retries
          });
        }

        const response = await fetch(url.toString(), config);
        clearTimeout(timeoutId);

        const contentType = response.headers.get('content-type');
        const data = contentType?.includes('application/json') ? await response.json() : null;

        if (__DEV__) {
          console.log(`API Response:`, {
            status: response.status,
            ok: response.ok,
            contentType,
            data: data ? '[HIDDEN]' : null
          });
        }

        if (!response.ok) {
          const error = new Error(data?.error || 'Request failed') as ApiError;
          error.status = response.status;
          error.data = data;
          throw error;
        }

        // If this is a login/register response and we got a token, save it
        if ((!requiresAuth && data?.token) || (endpoint === '/auth/login' || endpoint === '/auth/register')) {
          if (data.token) {
            await saveToken(data.token);
          }
        }

        setIsLoading(false);
        return data;
      } catch (error: any) {
        lastError = handleApiError(error, endpoint);
        
        // Don't retry on client errors (4xx) or network errors
        if (lastError.status && lastError.status < 500) {
          break;
        }
        
        attempt++;
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
          continue;
        }
      }
    }

    setIsLoading(false);
    setError(lastError?.message || 'Request failed after multiple attempts');
    throw lastError;
  }, [token, handleApiError, saveToken]);

  // Load token on mount
  useEffect(() => {
    async function loadInitialToken() {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Error loading token:', error);
        setError('Failed to load authentication token');
      }
    }
    
    loadInitialToken();
  }, []);

  return {
    apiCall,
    token,
    saveToken,
    clearToken,
    isLoading,
    error,
    isAuthenticated: !!token,
  };
};