import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { requestMediaLibraryPermission, requestCameraPermission } from '@/src/utils/permissions';
import { APP_CONFIG } from '@/src/config/constants';

export const useImagePicker = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickFromLibrary = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return null;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: APP_CONFIG.imageQuality,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        return imageUri;
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      return null;
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
  };

  return {
    selectedImage,
    setSelectedImage,
    pickFromLibrary,
    clearImage,
  };
};

