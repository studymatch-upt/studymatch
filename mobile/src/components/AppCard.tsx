import { StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, radius, shadow, spacing } from '@/theme/tokens';

export function AppCard({ style, ...props }: ViewProps) {
  const { colors } = useTheme();

  return (
    <View
      {...props}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadow, style]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: borderWidth.thin,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
});
