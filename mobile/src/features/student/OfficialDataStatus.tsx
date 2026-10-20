import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { LoadingState } from '@/components/LoadingState';
import { spacing } from '@/theme/tokens';
import { useDemoSession } from './DemoSession';

export function OfficialDataStatus() {
  const { official, officialLoading, officialError, refreshOfficial } = useDemoSession();
  if (!official) return null;
  return <View style={styles.row}>
    {officialLoading ? <LoadingState message="A atualizar dados académicos..." /> :
      <AppButton title={officialError ? 'Tentar novamente' : 'Atualizar dados'} variant="outline" size="sm" onPress={() => void refreshOfficial()} />}
    {officialError && <AppText variant="caption" tone="secondary" accessibilityRole="alert">{officialError} Os dados apresentados podem estar desatualizados.</AppText>}
  </View>;
}

const styles = StyleSheet.create({ row: { gap: spacing.xs } });
