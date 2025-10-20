import { useState } from 'react';
import { api } from '@/src/api';
import { useFriendStore } from '@/src/store';
import { useAuthStore } from '@/src/store';
import type { Friend } from '@/src/types';
import { showError, showSuccess } from '@/src/utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/src/config/constants';

export const useFriends = () => {
  const { user } = useAuthStore();
  const {
    friends,
    pendingRequests,
    sentRequests,
    isLoading,
    setFriends,
    setPendingRequests,
    setSentRequests,
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
        
        const userId = user?.id || user?._id;
        
        if (userId) {
          // Filter based on user ID and type
          const sentRequests = allFriends.filter(f => f.type === "request" && String(f.user1) === String(userId));
          const receivedRequests = allFriends.filter(f => f.type === "request" && String(f.user2) === String(userId));
          const friends = allFriends.filter(f => f.type === "friend");
          
          // Debug logging
          console.log('🔍 Sent requests:', sentRequests.length);
          console.log('🔍 Received requests:', receivedRequests.length);
          console.log('🔍 Friends:', friends.length);
          
          setFriends(friends);
          setPendingRequests(receivedRequests);
          setSentRequests(sentRequests);
        } else {
          const acceptedFriends = allFriends.filter((f) => f.type === 'friend');
          const pending = allFriends.filter((f) => f.type === 'request');
          
          setFriends(acceptedFriends);
          setPendingRequests(pending);
        }
        
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
        await fetchFriends(); 
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
        await fetchFriends(); 
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
    sentRequests,
    isLoading,
    fetchFriends,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
  };
};

