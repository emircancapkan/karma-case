import { TextStyle } from 'react-native';

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
} as const;

export const fontWeights = {
  normal: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
} as const;

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export const letterSpacings = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

// Typography Presets
export const typography = {
  // Headings
  h1: {
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: 40,
  } as TextStyle,
  
  h2: {
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: 36,
  } as TextStyle,
  
  h3: {
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: 32,
  } as TextStyle,
  
  h4: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semiBold,
    lineHeight: 28,
  } as TextStyle,
  
  h5: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
    lineHeight: 24,
  } as TextStyle,
  
  // Body Text
  bodyLarge: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.normal,
    lineHeight: 28,
  } as TextStyle,
  
  body: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.normal,
    lineHeight: 24,
  } as TextStyle,
  
  bodySmall: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.normal,
    lineHeight: 20,
  } as TextStyle,
  
  // Special
  caption: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.normal,
    lineHeight: 16,
  } as TextStyle,
  
  button: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.bold,
    letterSpacing: letterSpacings.wider,
  } as TextStyle,
  
  link: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
    textDecorationLine: 'underline',
  } as TextStyle,
  
  label: {
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semiBold,
  } as TextStyle,
} as const;

