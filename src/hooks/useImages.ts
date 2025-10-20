import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { api } from '@/src/api';
import { useImageStore } from '@/src/store';
import { useAuthStore } from '@/src/store';
import type { ImageFilters, GeneratedImage, PaginatedResponse } from '@/src/types';
import type { RootStackParamList } from '@/src/navigation/types';
import { showError, showSuccess } from '@/src/utils/helpers';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/src/config/constants';

const isPaginatedResponse = (data: any): data is PaginatedResponse<GeneratedImage> => {
  return data && typeof data === 'object' && 'data' in data && Array.isArray(data.data);
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const useImages = () => {
  const navigation = useNavigation<NavigationProp>();
  const { images, isLoading, setImages, addImage, setLoading, setError } = useImageStore();
  const { decrementCredits } = useAuthStore();
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchImages = async (filters?: ImageFilters) => {
    setLoading(true);
    try {
      console.log('🔄 Fetching images...');
      const response = await api.image.getImages(filters);
      
      console.log('📦 Full API response:', JSON.stringify(response.data, null, 2));
      
      if (response.data) {
        let rawImages: any[] = [];
        
        // Handle different response formats
        if (Array.isArray(response.data)) {
          rawImages = response.data;
          console.log('✅ Received images (direct array):', rawImages.length);
        } else if (response.data.data) {
          const responseData = response.data.data;
          
          if (Array.isArray(responseData)) {
            rawImages = responseData;
            console.log('✅ Received images (nested array format):', rawImages.length);
          } else if (isPaginatedResponse(responseData)) {
            rawImages = responseData.data;
            console.log('✅ Received images (paginated format):', rawImages.length);
          }
        }
        
        const imageData: GeneratedImage[] = rawImages.map((img: any) => ({
          id: img._id || img.id,
          url: img.url,
          prompt: img.prompt || '',
          createdAt: img.createdAt,
          userId: img.user || img.userId,
          latitude: img.latitude,
          longitude: img.longitude,
        }));
        
        console.log('🖼️  Setting images in store:', imageData.length);
        setImages(imageData);
        return { success: true, data: imageData };
      }
      
      console.log('⚠️  No data in response');
      return { success: false, data: [] };
    } catch (error: any) {
      console.error('❌ Error fetching images:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
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
        const rawImage: any = response.data.data;
        if (rawImage) {

          const transformedImage: GeneratedImage = {
            id: rawImage._id || rawImage.id,
            url: rawImage.url,
            prompt: rawImage.prompt || '',
            createdAt: rawImage.createdAt,
            userId: rawImage.user || rawImage.userId,
            latitude: rawImage.latitude,
            longitude: rawImage.longitude,
          };
          addImage(transformedImage);
        }
        
        // Decrement credits 
        decrementCredits();
        
        await fetchImages();
        
        showSuccess(SUCCESS_MESSAGES.imageGenerated);
        return { success: true, data: rawImage };
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

