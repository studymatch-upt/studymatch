import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, dimensions, opacity, radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  ...props
}: Props) {
  const { colors } = useTheme();
  const unavailable = disabled || loading;
  const backgroundColor = variant === 'primary'
    ? colors.primary
    : variant === 'secondary' ? colors.surfaceRaised : 'transparent';
  const foreground = variant === 'primary' ? colors.onPrimary : colors.text;

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel ?? title}
      accessibilityState={{ disabled: unavailable, busy: loading }}
      disabled={unavailable}
      style={({ pressed }) => [
        styles.base,
        size === 'sm' ? styles.small : styles.medium,
        { backgroundColor, borderColor: variant === 'outline' ? colors.border : backgroundColor },
        pressed && { opacity: opacity.pressed },
        unavailable && { opacity: opacity.disabled },
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={foreground} style={styles.spinner} />}
      <AppText variant="label" style={{ color: foreground }}>{title}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: borderWidth.thin,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
  },
  small: { minHeight: dimensions.controlSm },
  medium: { minHeight: dimensions.controlMd },
  spinner: { marginRight: spacing.xs },
});
