import { useState, useEffect, useCallback } from 'react';
import { api } from '@/src/api';
import type { GeneratedImage, ImageFilters } from '@/src/types';
import { showError } from '@/src/utils/helpers';

interface UseExploreResult {
  images: GeneratedImage[];
  isLoading: boolean;
  error: string | null;
  fetchExploreImages: (filters?: ImageFilters) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useExplore = (initialFilters?: ImageFilters): UseExploreResult => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ImageFilters | undefined>(initialFilters);

  const fetchExploreImages = useCallback(async (newFilters?: ImageFilters) => {
    console.log('🚀 Fetching explore images with filters:', newFilters);
    setIsLoading(true);
    setError(null);

    try {
      const filtersToUse = newFilters || filters || {};
      console.log('📡 API call with filters:', filtersToUse);
      const response = await api.explore.explore(filtersToUse);
      console.log('📡 API response:', response.data);
      
      if (response.data.success && response.data.data) {
        // Handle both array and paginated response
        const imageData = Array.isArray(response.data.data) 
          ? response.data.data 
          : response.data.data.data;
        
        console.log('📸 Raw image data:', imageData);
        
        // Map _id to id if needed and ensure userId is available
        const mappedImages = imageData.map((img: any) => ({
          ...img,
          id: img.id || img._id,
          userId: img.userId || img.user || img._id, // Use user field from API response
        }));
        
        console.log('📸 Mapped images:', mappedImages);
        setImages(mappedImages);
        if (newFilters) {
          setFilters(newFilters);
        }
      } else {
        console.log('❌ No data in response or not successful');
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to fetch explore images';
      setError(errorMessage);
      showError(errorMessage);
      console.error('❌ Error fetching explore images:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const refetch = useCallback(() => {
    return fetchExploreImages(filters);
  }, [filters, fetchExploreImages]);

  return {
    images,
    isLoading,
    error,
    fetchExploreImages,
    refetch,
  };
};

