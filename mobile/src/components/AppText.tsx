import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fontSize, fontWeight, lineHeight } from '@/theme/tokens';

type Variant = 'title' | 'heading' | 'body' | 'label' | 'caption';
type Tone = 'primary' | 'secondary' | 'accent' | 'inverse';

type Props = TextProps & {
  variant?: Variant;
  tone?: Tone;
};

const typeStyles = {
  title: { fontSize: fontSize.title, lineHeight: lineHeight.title, fontWeight: fontWeight.bold },
  heading: { fontSize: fontSize.heading, lineHeight: lineHeight.heading, fontWeight: fontWeight.bold },
  body: { fontSize: fontSize.body, lineHeight: lineHeight.body, fontWeight: fontWeight.regular },
  label: { fontSize: fontSize.small, lineHeight: lineHeight.small, fontWeight: fontWeight.semibold },
  caption: { fontSize: fontSize.caption, lineHeight: lineHeight.caption, fontWeight: fontWeight.medium },
} as const;

export function AppText({ variant = 'body', tone = 'primary', style, ...props }: Props) {
  const { colors } = useTheme();
  const color = {
    primary: colors.text,
    secondary: colors.textSecondary,
    accent: colors.accentText,
    inverse: colors.onPrimary,
  }[tone];

  return <Text {...props} style={[typeStyles[variant], { color }, style]} />;
}
