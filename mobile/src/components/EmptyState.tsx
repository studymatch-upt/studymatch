import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, dimensions, radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.symbol, { borderColor: colors.border }]}>
        <View style={[styles.dot, { backgroundColor: colors.primaryBright }]} />
      </View>
      <AppText variant="label" style={styles.center}>{title}</AppText>
      <AppText variant="caption" tone="secondary" style={styles.center}>{description}</AppText>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.xs, padding: spacing.lg },
  symbol: {
    width: dimensions.symbol,
    height: dimensions.symbol,
    borderRadius: radius.pill,
    borderWidth: borderWidth.thin,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  dot: { width: spacing.xs, height: spacing.xs, borderRadius: radius.pill },
  center: { textAlign: 'center' },
});
