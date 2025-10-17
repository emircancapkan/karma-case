import { useState } from 'react';
import { api } from '@/src/api';
import { useFriendStore } from '@/src/store';
import type { Friend } from '@/src/types';
import { showError, showSuccess } from '@/src/utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/src/config/constants';

export const useFriends = () => {
  const {
    friends,
    pendingRequests,
    isLoading,
    setFriends,
    setPendingRequests,
    acceptRequest: acceptRequestStore,
    rejectRequest: rejectRequestStore,
    setLoading,
    setError,
  } = useFriendStore();

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const response = await api.friend.getFriends();
      
      if (response.data) {
        let allFriends: Friend[] = [];
        
        if (Array.isArray(response.data)) {
          allFriends = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          allFriends = response.data.data;
        }
        
        const acceptedFriends = allFriends.filter((f) => f.status === 'accepted');
        const pending = allFriends.filter((f) => f.status === 'pending');
        
        setFriends(acceptedFriends);
        setPendingRequests(pending);
        
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      if (error.response?.status !== 401) {
        console.error('Error fetching friends:', error);
        setError(error.response?.data?.message || ERROR_MESSAGES.generic);
      }
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    try {
      const response = await api.friend.sendRequest({ targetUserId });
      
      if (response.data.success) {
        showSuccess('Friend request sent!');
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      showError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const acceptRequest = async (friendId: string) => {
    try {
      const response = await api.friend.acceptRequest({ friendId });
      
      if (response.data.success) {
        acceptRequestStore(friendId);
        showSuccess(SUCCESS_MESSAGES.friendRequestAccepted);
        await fetchFriends(); // Refresh list
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      showError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const rejectRequest = async (friendId: string) => {
    try {
      const response = await api.friend.deleteFriend({ friendId });
      
      if (response.data.success) {
        rejectRequestStore(friendId);
        showSuccess(SUCCESS_MESSAGES.friendRequestRejected);
        await fetchFriends(); // Refresh list
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      showError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      const response = await api.friend.deleteFriend({ friendId });
      
      if (response.data.success) {
        await fetchFriends(); // Refresh list
        showSuccess('Friend removed');
        return { success: true };
      }
      
      return { success: false };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      showError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  return {
    friends,
    pendingRequests,
    isLoading,
    fetchFriends,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  };
};

