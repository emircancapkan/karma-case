import { AxiosResponse } from 'axios';
import { apiClient } from '../client';
import type { User, ApiResponse } from '@/src/types';

export interface UpdateUserPayload {
  username?: string;
  mail?: string;
  password?: string;
}

export const userEndpoints = {
  /**
   * Get current user profile
   */
  getProfile: (): Promise<AxiosResponse<ApiResponse<User>>> => {
    return apiClient.get('/user/profile');
  },

  /**
   * Update user profile
   */
  update: (data: UpdateUserPayload): Promise<AxiosResponse<ApiResponse<User>>> => {
    return apiClient.post('/user/update', data);
  },

  /**
   * Delete user account
   */
  delete: (): Promise<AxiosResponse<ApiResponse>> => {
    return apiClient.delete('/user/delete');
  },

  /**
   * Purchase premium membership
   */
  purchase: (): Promise<AxiosResponse<ApiResponse>> => {
    return apiClient.post('/user/purchase');
  },
};

