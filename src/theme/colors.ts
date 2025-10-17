export const colors = {
  // Primary Colors
  primary: '#7C3AED',
  primaryLight: '#C4B5FD',
  primaryDark: '#5B21B6',
  primaryBackground: '#F5F3FF',
  primaryBorder: '#EDE9FE',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray Scale
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Semantic Colors
  success: '#10B981',
  successLight: '#D1FAE5',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  
  // UI Colors
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  // Text Colors
  textPrimary: '#000000',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textDisabled: '#D1D5DB',
  textPlaceholder: '#D1D5DB',
  
  // Component Specific
  cardBackground: '#F9FAFB',
  inputBackground: '#F9FAFB',
  buttonDisabled: '#C4B5FD',
  iconDefault: '#9CA3AF',
  
  // Social & Interactive
  linkColor: '#7C3AED',
  shadowColor: '#000000',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export type ColorKey = keyof typeof colors;

