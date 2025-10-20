import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { ERROR_MESSAGES } from '@/src/config/constants';


export const requestMediaLibraryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photos to upload images.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting media permission:', error);
    return false;
  }
};


export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your camera to take photos.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting camera permission:', error);
    return false;
  }
};


export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your location to use this feature.',
        [{ text: 'OK' }]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return false;
  }
};


export const requestAllPermissions = async (): Promise<boolean> => {
  const mediaGranted = await requestMediaLibraryPermission();
  const locationGranted = await requestLocationPermission();
  
  return mediaGranted && locationGranted;
};


export const hasMediaLibraryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();
  return status === 'granted';
};


export const hasLocationPermission = async (): Promise<boolean> => {
  const { status } = await Location.getForegroundPermissionsAsync();
  return status === 'granted';
};

