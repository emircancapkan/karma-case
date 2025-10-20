import { AxiosResponse } from 'axios';
import { apiClient } from '../client';
import type {
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
  ApiResponse,
} from '@/src/types';

export const authEndpoints = {
  /**
   * Login user
   */
  login: (credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> => {
    return apiClient.post('/auth/login', credentials);
  },

  /**
   * Register new user
   */
  register: (credentials: SignupCredentials): Promise<AxiosResponse<AuthResponse>> => {
    return apiClient.post('/auth/register', credentials);
  },

  /**
   * Check username 
   */
  checkUsername: (username: string): Promise<AxiosResponse<ApiResponse<boolean>>> => {
    return apiClient.post('/auth/check-username', { username });
  },

  /* Check email and send verification code
   */
  checkMail: (mail: string): Promise<AxiosResponse<ApiResponse<boolean>>> => {
    return apiClient.post('/auth/check-mail', { mail });
  },

  /**
   * Logout
   */
  logout: (): Promise<AxiosResponse<ApiResponse>> => {
    return apiClient.post('/auth/logout');
  },
};

