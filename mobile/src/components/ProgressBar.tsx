import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = {
  value: number;
  label?: string;
};

export function ProgressBar({ value, label }: Props) {
  const { colors } = useTheme();
  const progress = Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.heading}>
          <AppText variant="label">{label}</AppText>
          <AppText variant="caption" tone="accent">{Math.round(progress)}%</AppText>
        </View>
      )}
      <View
        accessibilityRole="progressbar"
        accessibilityLabel={label ?? 'Progresso'}
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
        style={[styles.track, { backgroundColor: colors.track }]}
      >
        <View style={[styles.fill, { backgroundColor: colors.primaryBright, width: `${progress}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  heading: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: spacing.xs, borderRadius: radius.pill, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radius.pill },
});
