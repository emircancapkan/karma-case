import { APP_CONFIG } from '@/src/config/constants';

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate username
 */
export const isValidUsername = (username: string): boolean => {
  if (!username || username.trim().length < APP_CONFIG.minUsernameLength) {
    return false;
  }
  
  if (username.length > APP_CONFIG.maxUsernameLength) {
    return false;
  }
  
  // Username should only contain alphanumeric characters and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  if (password && password.length >= APP_CONFIG.minPasswordLength) {
    return true;
  }
  return false;
};

/**
 * Validate verification code
 */
export const isValidVerificationCode = (code: string): boolean => {
  if (code && code.length === APP_CONFIG.verificationCodeLength && /^\d+$/.test(code)) {
    return true;
  }
  return false;
};

/**
 * Validate image file
 */
export const isValidImageFile = (fileType: string, fileSize: number): { valid: boolean; error?: string } => {
  const allowedTypes = APP_CONFIG.allowedImageTypes as readonly string[];
  
  if (!allowedTypes.includes(fileType)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
    };
  }
  
  if (fileSize > APP_CONFIG.maxImageSize) {
    return {
      valid: false,
      error: `File size too large. Maximum size: ${APP_CONFIG.maxImageSize / (1024 * 1024)}MB`,
    };
  }
  
  return { valid: true };
};

/**
 * Validate coordinates
 */
export const isValidCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

/**
 * Get validation error message
 */
export const getValidationError = (field: string, value: string): string | null => {
  switch (field) {
    case 'username':
      if (!value || value.trim().length < APP_CONFIG.minUsernameLength) {
        return `Username must be at least ${APP_CONFIG.minUsernameLength} characters`;
      }
      if (!isValidUsername(value)) {
        return 'Username can only contain letters, numbers, and underscores';
      }
      return null;
      
    case 'password':
      if (!value || value.length < APP_CONFIG.minPasswordLength) {
        return `Password must be at least ${APP_CONFIG.minPasswordLength} characters`;
      }
      return null;
      
    case 'email':
      if (!value || !isValidEmail(value)) {
        return 'Invalid email format';
      }
      return null;
      
    case 'code':
      if (!isValidVerificationCode(value)) {
        return 'Verification code must be 4 digits';
      }
      return null;
      
    default:
      return null;
  }
};

