import { AxiosResponse } from 'axios';
import { apiClient } from '../client';
import type { GeneratedImage, ImageFilters, ApiResponse, PaginatedResponse } from '@/src/types';

export const exploreEndpoints = {
  /**
   * Explore nearby images on map
   */
  explore: (
    filters: ImageFilters
  ): Promise<AxiosResponse<ApiResponse<GeneratedImage[] | PaginatedResponse<GeneratedImage>>>> => {
    return apiClient.post('/explore', filters);
  },

  /**
   * Get trending images
   */
  getTrending: (): Promise<AxiosResponse<ApiResponse<GeneratedImage[]>>> => {
    return apiClient.get('/explore/trending');
  },

  /**
   * Search images by query
   */
  search: (query: string, filters?: ImageFilters): Promise<AxiosResponse<ApiResponse<GeneratedImage[]>>> => {
    return apiClient.get('/explore/search', {
      params: { query, ...filters },
    });
  },
};

