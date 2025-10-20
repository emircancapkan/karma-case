import { create } from 'zustand';
import type { Friend } from '@/src/types';

interface FriendState {
  friends: Friend[];
  pendingRequests: Friend[];
  sentRequests: Friend[];
  isLoading: boolean;
  error: string | null;
  
  setFriends: (friends: Friend[]) => void;
  setPendingRequests: (requests: Friend[]) => void;
  setSentRequests: (requests: Friend[]) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  acceptRequest: (friendId: string) => void;
  rejectRequest: (friendId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFriendStore = create<FriendState>((set) => ({
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  isLoading: false,
  error: null,

  setFriends: (friends) => {
    set({ friends, error: null });
  },

  setPendingRequests: (requests) => {
    set({ pendingRequests: requests, error: null });
  },

  setSentRequests: (requests) => {
    set({ sentRequests: requests, error: null });
  },

  addFriend: (friend) => {
    set((state) => ({
      friends: [...state.friends, friend],
    }));
  },

  removeFriend: (friendId) => {
    set((state) => ({
      friends: state.friends.filter((f) => f.id !== friendId),
    }));
  },

  acceptRequest: (friendId) => {
    set((state) => {
      const request = state.pendingRequests.find((r) => r.id === friendId);
      if (!request) return state;
      
      return {
        pendingRequests: state.pendingRequests.filter((r) => r.id !== friendId),
        friends: [...state.friends, { ...request, status: 'accepted' }],
      };
    });
  },

  rejectRequest: (friendId) => {
    set((state) => ({
      pendingRequests: state.pendingRequests.filter((r) => r.id !== friendId),
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },
}));

