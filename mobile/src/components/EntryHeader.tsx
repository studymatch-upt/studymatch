import { useRouter, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { opacity, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = { back?: boolean; backTo?: Href; label?: string };

export function EntryHeader({ back = false, backTo = '/', label }: Props) {
  const router = useRouter();
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
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  spacer: { width: 64 },
  pressed: { opacity: opacity.pressed },
});
