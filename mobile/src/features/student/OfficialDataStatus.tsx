import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { dimensions, opacity, spacing } from '@/theme/tokens';
import { useDemoSession } from './DemoSession';

export function OfficialDataStatus() {
  const { colors } = useTheme();
  const { official, officialLoading, officialError, refreshOfficial } = useDemoSession();
  if (!official) return null;

  return <View style={styles.container}>
    <Pressable accessibilityRole="button" accessibilityLabel={officialError ? 'Tentar atualizar dados novamente' : 'Atualizar dados'} accessibilityState={{ busy: officialLoading, disabled: officialLoading }} disabled={officialLoading} onPress={() => void refreshOfficial()} style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
      {officialLoading && <ActivityIndicator size="small" color={colors.accentText} />}
      <AppText variant="caption" tone="accent">{officialLoading ? 'A atualizar…' : officialError ? 'Tentar novamente ↻' : 'Atualizar dados ↻'}</AppText>
    </Pressable>
    {officialError && <AppText variant="caption" style={{ color: colors.error.text, alignSelf: 'stretch' }} accessibilityRole="alert">{officialError} Os dados apresentados podem estar desatualizados.</AppText>}
  </View>;
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxs, alignItems: 'flex-end' },
  action: { minHeight: dimensions.controlSm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  pressed: { opacity: opacity.pressed },
});
