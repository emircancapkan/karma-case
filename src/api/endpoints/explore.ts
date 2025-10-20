import { AxiosResponse } from 'axios';
import { apiClient } from '../client';
import type { GeneratedImage, ImageFilters, ApiResponse, PaginatedResponse } from '@/src/types';

export const exploreEndpoints = {
  /**
   * Explore images
   */
  explore: (
    filters: ImageFilters
  ): Promise<AxiosResponse<ApiResponse<GeneratedImage[] | PaginatedResponse<GeneratedImage>>>> => {
    return apiClient.post('/explore', {
      range: filters.range || 10,
      latitude: filters.latitude,
      longitude: filters.longitude,
    });
  },
};

