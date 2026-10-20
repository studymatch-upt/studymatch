import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { dimensions, opacity, radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = { back?: boolean; backTo?: Href; label?: string };

export function EntryHeader({ back = false, backTo = '/', label }: Props) {
  const router = useRouter();
  const { colors, resolvedTheme, setPreference } = useTheme();

  return (
    <View style={styles.row}>
      {back ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          hitSlop={spacing.xs}
          onPress={() => router.canGoBack() ? router.back() : router.replace(backTo)}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <AppText variant="heading">‹</AppText>
          <AppText variant="label">Voltar</AppText>
        </Pressable>
      ) : <View style={styles.spacer} />}
      {label && <AppText variant="caption" tone="secondary">{label}</AppText>}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ativar modo ${resolvedTheme === 'dark' ? 'claro' : 'escuro'}`}
        hitSlop={spacing.xs}
        onPress={() => setPreference(resolvedTheme === 'dark' ? 'light' : 'dark')}
        style={({ pressed }) => [
          styles.theme,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.pressed,
        ]}
      >
        <AppText variant="body" tone="accent">{resolvedTheme === 'dark' ? '☀' : '☾'}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: dimensions.controlMd, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minHeight: dimensions.controlMd, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  spacer: { width: dimensions.controlMd },
  theme: { width: dimensions.controlMd, height: dimensions.controlMd, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: opacity.pressed },
});
