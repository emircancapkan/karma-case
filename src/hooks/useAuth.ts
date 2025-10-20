import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '@/src/api';
import { useAuthStore } from '@/src/store';
import type { LoginCredentials, SignupCredentials } from '@/src/types';
import type { RootStackParamList } from '@/src/navigation/types';
import { showSuccess } from '@/src/utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/src/config/constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useAuth = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isAuthenticated, login, logout, updateUser, decrementCredits } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.auth.login(credentials);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        await login(user, token);
        showSuccess(SUCCESS_MESSAGES.loginSuccess);
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
        return { success: true };
      } else {
        return { success: false, error: ERROR_MESSAGES.invalidCredentials };
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (credentials: SignupCredentials) => {
    setIsLoading(true);
    try {
      const response = await api.auth.register(credentials);
      
      console.log('🔐 Signup API Response:', response.data);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Ensure mail field is set (handle both 'mail' and 'email' field names)
        const userData = {
          ...user,
          mail: user.mail || user.email || credentials.mail,
        };
        
        console.log('👤 User data to be stored:', userData);
        
        await login(userData, token);
        // Don't show success toast or navigate automatically - let the UI handle it
        return { success: true };
      } else {
        return { success: false, error: ERROR_MESSAGES.generic };
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkUsername = async (username: string) => {
    try {
      const response = await api.auth.checkUsername(username);
      return response.data.success;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || ERROR_MESSAGES.usernameTaken);
    }
  };

  const checkEmail = async (email: string) => {
    try {
      const response = await api.auth.checkMail(email);
      return response.data.success;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || ERROR_MESSAGES.emailTaken);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    checkUsername,
    checkEmail,
    updateUser,
    decrementCredits,
  };
};

