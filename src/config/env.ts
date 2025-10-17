import Constants from 'expo-constants';

interface EnvironmentConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  enableLogging: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  // Get API URL from environment variables or use default
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com';
  
  // Determine environment
  const isDevelopment = __DEV__;
  const environment = isDevelopment ? 'development' : 'production';
  
  return {
    apiUrl,
    environment,
    enableLogging: isDevelopment,
  };
};

export const config = getEnvironmentConfig();

// Export individual values for convenience
export const { apiUrl, environment, enableLogging } = config;

