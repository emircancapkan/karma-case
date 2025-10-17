import { AxiosResponse, AxiosRequestConfig } from 'axios';
import { apiClient } from '../client';
import type { GeneratedImage, ImageFilters, ApiResponse, PaginatedResponse } from '@/src/types';

export const imageEndpoints = {
  /**
   * Upload image and generate AI content
   */
  upload: (
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<ApiResponse<GeneratedImage>>> => {
    return apiClient.post('/image/upload', formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  },

  /**
   * Get user's generated images
   */
  getImages: (
    params?: ImageFilters
  ): Promise<AxiosResponse<ApiResponse<GeneratedImage[] | PaginatedResponse<GeneratedImage>>>> => {
    return apiClient.get('/image', { params });
  },

  /**
   * Get single image by ID
   */
  getImageById: (id: string): Promise<AxiosResponse<ApiResponse<GeneratedImage>>> => {
    return apiClient.get(`/image/${id}`);
  },

  /**
   * Delete image
   */
  deleteImage: (id: string): Promise<AxiosResponse<ApiResponse>> => {
    return apiClient.delete(`/image/${id}`);
  },
};

