import { useState } from 'react';
import * as Location from 'expo-location';
import { requestLocationPermission } from '@/src/utils/permissions';
import { showError } from '@/src/utils/helpers';
import { ERROR_MESSAGES } from '@/src/config/constants';

export const useLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      const locationData = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      };
      
      setLocation(coords);
      return coords;
    } catch (error) {
      console.error('Error getting location:', error);
      showError(ERROR_MESSAGES.locationPermissionDenied);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    location,
    isLoading,
    getCurrentLocation,
  };
};

