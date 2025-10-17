import { AxiosResponse } from 'axios';
import { apiClient } from '../client';
import type { Friend, FriendRequest, FriendActionRequest, ApiResponse } from '@/src/types';

export const friendEndpoints = {
  /**
   * Get user's friends list
   */
  getFriends: (): Promise<AxiosResponse<ApiResponse<Friend[]>>> => {
    return apiClient.get('/friend');
  },

  /**
   * Send friend request
   */
  sendRequest: (data: FriendRequest): Promise<AxiosResponse<ApiResponse>> => {
    return apiClient.post('/friend/request', data);
  },

  /**
   * Accept friend request
   */
  acceptRequest: (data: FriendActionRequest): Promise<AxiosResponse<ApiResponse>> => {
    return apiClient.post('/friend/accept', data);
  },

  /**
   * Reject/Delete friend
   */
  deleteFriend: (data: FriendActionRequest): Promise<AxiosResponse<ApiResponse>> => {
    return apiClient.delete('/friend/delete', { data });
  },

  /**
   * Get pending friend requests
   */
  getPendingRequests: (): Promise<AxiosResponse<ApiResponse<Friend[]>>> => {
    return apiClient.get('/friend/pending');
  },
};

