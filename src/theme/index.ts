import { colors } from './colors';
import { typography, fontSizes, fontWeights, lineHeights, letterSpacings } from './typography';
import { spacing, borderRadius, iconSizes, avatarSizes } from './spacing';
import { shadows } from './shadows';

export const theme = {
  colors,
  typography,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  spacing,
  borderRadius,
  iconSizes,
  avatarSizes,
  shadows,
} as const;

export type Theme = typeof theme;

export { colors, typography, fontSizes, fontWeights, spacing, borderRadius, shadows };
export * from './colors';
export * from './typography';
export * from './spacing';
export * from './shadows';

