import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Status = 'success' | 'warning' | 'error' | 'info' | 'neutral';

type Props = {
  label: string;
  status?: Status;
};

export function AppBadge({ label, status = 'neutral' }: Props) {
  const { colors } = useTheme();
  const palette = status === 'neutral'
    ? { background: colors.surfaceRaised, text: colors.textSecondary }
    : colors[status];

  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      <AppText variant="caption" style={{ color: palette.text }}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: spacing.xxs,
    paddingHorizontal: spacing.sm,
  },
});
