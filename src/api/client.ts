import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl } from '@/src/config';
import { STORAGE_KEYS } from '@/src/config/constants';

// Create axios
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: apiUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add auth token
  client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      try {
        // Public endpoints that don't require authentication
        const publicEndpoints = [
          '/auth/login',
          '/auth/register',
          '/auth/check-username',
          '/auth/check-mail',
        ];
        
        const isPublicEndpoint = publicEndpoints.some((endpoint) =>
          config.url?.includes(endpoint)
        );

        if (!isPublicEndpoint) {
          const token = await AsyncStorage.getItem(STORAGE_KEYS.authToken);
          console.log('🔑 Token from storage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('✅ Authorization header set');
          } else {
            console.log('❌ No token or headers available');
          }
        }

        // Debug image
        if (config.url?.includes('/image')) {
          console.log('🌐 API Request:', config.method?.toUpperCase(), config.url);
          console.log('🔐 Headers:', config.headers);
          if (config.data instanceof FormData) {
            console.log('📦 FormData being sent to backend');
          }
        }
      } catch (error) {
        console.error('Error adding auth token:', error);
      }
      
      return config;
    },
    (error) => Promise.reject(error)
  );

  // errors
  client.interceptors.response.use(
    (response) => {
      // Debug logging for image upload response
      if (response.config.url?.includes('/image/upload')) {
        console.log('✅ API Response:', response.status);
        console.log('📥 Response data:', response.data);
      }
      return response;
    },
    async (error) => {
      if (error.response) {
        const status = error.response.status;
        
        // Handle specific error codes
        switch (status) {
          case 401:
            // Unauthorized - could trigger logout
            console.error('Unauthorized access');
            break;
          case 403:
            console.error('Forbidden');
            break;
          case 404:
            console.error('Resource not found');
            break;
          case 500:
            console.error('Server error');
            break;
          default:
            console.error('API Error:', error.response.data);
        }
      } else if (error.request) {
        console.error('Network Error - No response received');
      } else {
        console.error('Error:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

