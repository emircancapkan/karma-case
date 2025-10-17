import { useState, useEffect } from 'react';
import { api } from '@/src/api';
import { useImageStore } from '@/src/store';
import { useAuthStore } from '@/src/store';
import type { ImageFilters, GeneratedImage, PaginatedResponse } from '@/src/types';
import { showError, showSuccess } from '@/src/utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/src/config/constants';

// Type guard to check if response is PaginatedResponse
const isPaginatedResponse = (data: any): data is PaginatedResponse<GeneratedImage> => {
  return data && typeof data === 'object' && 'data' in data && Array.isArray(data.data);
};

export const useImages = () => {
  const { images, isLoading, setImages, addImage, setLoading, setError } = useImageStore();
  const { updateUser } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchImages = async (filters?: ImageFilters) => {
    setLoading(true);
    try {
      const response = await api.image.getImages(filters);
      
      if (response.data && response.data.data) {
        const responseData = response.data.data;
        let imageData: GeneratedImage[] = [];
        
        // Handle different response formats
        if (Array.isArray(responseData)) {
          // Direct array: GeneratedImage[]
          imageData = responseData;
        } else if (isPaginatedResponse(responseData)) {
          // PaginatedResponse: { data: GeneratedImage[], page, limit, total, totalPages }
          imageData = responseData.data;
        }
        
        setImages(imageData);
        return { success: true, data: imageData };
      }
      
      return { success: false, data: [] };
    } catch (error: any) {
      // Don't show error for 401 (user might not have images yet)
      if (error.response?.status !== 401) {
        console.error('Error fetching images:', error);
        setError(error.response?.data?.message || ERROR_MESSAGES.generic);
      }
      setImages([]);
      return { success: false, data: [] };
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async (formData: FormData) => {
    setIsGenerating(true);
    try {
      const response = await api.image.upload(formData);
      
      if (response.data) {
        const newImage = response.data.data;
        if (newImage) {
          addImage(newImage);
        }
        
        // Refresh images list to get updated data
        await fetchImages();
        
        showSuccess(SUCCESS_MESSAGES.imageGenerated);
        return { success: true, data: newImage };
      }
      
      return { success: false };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || ERROR_MESSAGES.generic;
      showError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    images,
    isLoading,
    isGenerating,
    fetchImages,
    generateImage,
  };
};

