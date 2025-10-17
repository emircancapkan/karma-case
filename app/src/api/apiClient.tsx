import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased for image upload
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {

      const publicEndpoints = ['/auth/login', '/auth/register', '/auth/check-username', '/auth/check-mail'];
      const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
      
      if (isPublicEndpoint) {
        console.log('Public endpoint, no token needed:', config.url);
        return config;
      }

      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token added to request:', token.substring(0, 20) + '...');
      } else {
        console.log('No token found for request to:', config.url);
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });
      
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        console.log('401 Unauthorized - Token might be invalid or missing');
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - No response received');
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH ENDPOINTS
// ============================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  mail: string;
  code?: string | number;
}

export interface CheckUsernameRequest {
  username: string;
}

export interface CheckMailRequest {
  mail: string;
}

export const authAPI = {
  login: (data: LoginRequest): Promise<AxiosResponse> => {
    return apiClient.post('/auth/login', data);
  },

  register: (data: RegisterRequest): Promise<AxiosResponse> => {
    return apiClient.post('/auth/register', data);
  },

  checkUsername: (data: CheckUsernameRequest): Promise<AxiosResponse> => {
    return apiClient.post('/auth/check-username', data);
  },

  checkMail: (data: CheckMailRequest): Promise<AxiosResponse> => {
    return apiClient.post('/auth/check-mail', data);
  },
};

// ============================================
// USER ENDPOINTS
// ============================================

export interface UpdateUserRequest {
  username?: string;
  mail?: string;
  password?: string;
}

export const userAPI = {
  // POST /user/update - Update user
  update: (data: UpdateUserRequest): Promise<AxiosResponse> => {
    return apiClient.post('/user/update', data);
  },

  // DELETE /user/delete - Delete user
  delete: (): Promise<AxiosResponse> => {
    return apiClient.delete('/user/delete');
  },

  purchase: (): Promise<AxiosResponse> => {
    return apiClient.post('/user/purchase');
  },
};

// ============================================
// IMAGE ENDPOINTS
// ============================================

export interface UploadImageRequest {
  file: any; // File upload 
  latitude: number; // Location latitude
  longitude: number; // Location longitude
  prompt: string; // prompt
}

export interface GetImagesParams {
  latitude?: number; // Filter by location
  longitude?: number; // Filter by location
  radius?: number; // Search radius in km
  page?: number;
  limit?: number;
}

export const imageAPI = {
  upload: (data: UploadImageRequest | FormData, config?: AxiosRequestConfig): Promise<AxiosResponse> => {
    return apiClient.post('/image/upload', data, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  },

  getImages: (params?: GetImagesParams): Promise<AxiosResponse> => {
    return apiClient.get('/image', { params });
  },
};

// ============================================
// FRIEND ENDPOINTS
// ============================================

export interface FriendRequestRequest {
  targetUserId: string;
}

export interface DeleteFriendRequest {
  friendId: string;
}

export interface AcceptFriendRequest {
  friendId: string;
}

export const friendAPI = {
  request: (data: FriendRequestRequest): Promise<AxiosResponse> => {
    return apiClient.post('/friend/request', data);
  },

  delete: (data: DeleteFriendRequest): Promise<AxiosResponse> => {
    return apiClient.delete('/friend/delete', { data });
  },

  accept: (data: AcceptFriendRequest): Promise<AxiosResponse> => {
    return apiClient.post('/friend/accept', data);
  },

  getFriends: (params?: any): Promise<AxiosResponse> => {
    return apiClient.get('/friend', { params });
  },
};

// ============================================
// EXPLORE ENDPOINTS
// ============================================

export interface ExploreRequest {
  latitude?: number; 
  longitude?: number; 
  radius?: number; 
  page?: number;
  limit?: number;
  filters?: {
    userId?: string; 
    dateRange?: {
      start?: string;
      end?: string;
    };
  };
}

export const exploreAPI = {
  // POST /explore - Explore nearby images on the map
  explore: (data: ExploreRequest): Promise<AxiosResponse> => {
    return apiClient.post('/explore', data);
  },
};

// Export the axios instance for custom requests
export default apiClient;

