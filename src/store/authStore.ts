import { create } from 'zustand';
import type { User } from '@/src/types';
import { storage } from '@/src/utils/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
  login: (user: User, token: string) => Promise<void>;
  loadUserFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },

  updateUser: (updates) => {
    set((state) => {
      if (!state.user) return state;
      const updatedUser = { ...state.user, ...updates };
      storage.setUserData(updatedUser); // Persist to storage
      return { user: updatedUser };
    });
  },

  login: async (user, token) => {
    await storage.setAuthToken(token);
    await storage.setUserData(user);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await storage.removeAuthToken();
    await storage.removeUserData();
    set({ user: null, isAuthenticated: false });
  },

  loadUserFromStorage: async () => {
    try {
      const token = await storage.getAuthToken();
      const user = await storage.getUserData();
      
      if (token && user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

