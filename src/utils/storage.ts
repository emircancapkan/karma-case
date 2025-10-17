import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/config/constants';
import type { User } from '@/src/types';

/**
 * Storage utility for managing AsyncStorage operations
 */

export const storage = {
  // Auth Token
  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.authToken);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  },

  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.authToken, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  },

  async removeAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.authToken);
    } catch (error) {
      console.error('Error removing auth token:', error);
    }
  },

  // User Data
  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.userData);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  },

  async setUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.userData, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user data:', error);
    }
  },

  async updateUserData(updates: Partial<User>): Promise<void> {
    try {
      const currentUser = await this.getUserData();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        await this.setUserData(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  },

  async removeUserData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.userData);
    } catch (error) {
      console.error('Error removing user data:', error);
    }
  },

  // Generic storage methods
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const item = await AsyncStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
    }
  },

  // Clear all storage
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};

