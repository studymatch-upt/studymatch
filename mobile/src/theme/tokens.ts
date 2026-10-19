import { Platform } from 'react-native';

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const fontSize = {
  caption: 12,
  small: 14,
  body: 16,
  heading: 20,
  title: 28,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const lineHeight = {
  caption: 18,
  small: 20,
  body: 24,
  heading: 28,
  title: 36,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const dimensions = { controlSm: 40, controlMd: 48, symbol: 44 } as const;

export const borderWidth = { thin: 1, strong: 2 } as const;

export const opacity = { pressed: 0.82, disabled: 0.5 } as const;

export const shadow = Platform.select({
  ios: {
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  default: { elevation: 2 },
});
