import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { dimensions, opacity, radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

export type SegmentOption<T extends string> = { label: string; value: T };

type Props<T extends string> = {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: Props<T>) {
  const { colors } = useTheme();

  return (
    <View accessibilityLabel={label} style={[styles.track, { backgroundColor: colors.surfaceRaised }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: colors.surface },
              pressed && { opacity: opacity.pressed },
              disabled && { opacity: opacity.disabled },
            ]}
          >
            <AppText variant="label" style={{ color: selected ? colors.text : colors.textSecondary }}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: radius.md, padding: spacing.xxs },
  segment: {
    flex: 1,
    minHeight: dimensions.controlSm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
});
