import Constants from 'expo-constants';

interface EnvironmentConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  enableLogging: boolean;
  googleMapsApiKey: string;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Get API URL from environment variables or use default
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';
  
  // Get Google Maps API Key from environment variables
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || Constants.expoConfig?.extra?.googleMapsApiKey || '';
  
  // Determine environment
  const isDevelopment = __DEV__;
  const environment = isDevelopment ? 'development' : 'production';
  
  return {
    apiUrl,
    environment,
    enableLogging: isDevelopment,
    googleMapsApiKey,
  };
};

export const config = getEnvironmentConfig();

// Export individual values for convenience
export const { apiUrl, environment, enableLogging, googleMapsApiKey } = config;

