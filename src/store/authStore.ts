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
  decrementCredits: () => void;
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

  decrementCredits: () => {
    set((state) => {
      if (!state.user || state.user.isPremium) return state;
      const newCredits = Math.max(0, (state.user.credits || 0) - 1);
      const updatedUser = { ...state.user, credits: newCredits };
      storage.setUserData(updatedUser); // Persist to storage
      return { user: updatedUser };
    });
  },

  login: async (user, token) => {
    // Import imageStore dynamically to avoid circular dependency
    const { useImageStore } = await import('./imageStore');
    const { clearImages } = useImageStore.getState();
    
    await storage.setAuthToken(token);
    await storage.setUserData(user);
    clearImages(); // Clear previous user's images before login
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    // Import imageStore dynamically to avoid circular dependency
    const { useImageStore } = await import('./imageStore');
    const { clearImages } = useImageStore.getState();
    
    await storage.removeAuthToken();
    await storage.removeUserData();
    clearImages(); // Clear images when logging out
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

