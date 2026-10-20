import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { spacing } from '@/theme/tokens';
import { useDemoSession } from './DemoSession';
import { getDemoStudentByEmail, type DemoStudentEmail } from './studentApi';

export function DemoAccountPanel() {
  const { startOfficialStudentSession } = useDemoSession();
  const inFlight = useRef(false);
  const [busy, setBusy] = useState<DemoStudentEmail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [failedEmail, setFailedEmail] = useState<DemoStudentEmail | null>(null);

  if (!__DEV__) return null;

  async function select(email: DemoStudentEmail) {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(email);
    setError(null);
    try {
      const student = await getDemoStudentByEmail(email);
      await startOfficialStudentSession(student);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível ligar ao backend.');
      setFailedEmail(email);
    } finally {
      inFlight.current = false;
      setBusy(null);
    }
  }

  return <AppCard style={styles.card}>
    <AppText variant="label" accessibilityRole="header">Alunos de teste</AppText>
    <AppText variant="caption" tone="secondary">Acesso demonstrativo · apenas desenvolvimento</AppText>
    <View style={styles.account}>
      <AppButton title="Carla Mendes" variant="secondary" size="sm" loading={busy === 'carla@school.test'} disabled={busy !== null} onPress={() => void select('carla@school.test')} />
      <AppText variant="caption" tone="secondary">Aluna com histórico académico</AppText>
    </View>
    <View style={styles.account}>
      <AppButton title="Diogo Ferreira" variant="secondary" size="sm" loading={busy === 'diogo@school.test'} disabled={busy !== null} onPress={() => void select('diogo@school.test')} />
      <AppText variant="caption" tone="secondary">Aluno sem histórico académico inicial</AppText>
    </View>
    {error && <>
      <AppText variant="caption" tone="secondary" accessibilityRole="alert">{error}</AppText>
      {failedEmail && <AppButton title="Tentar novamente" variant="outline" size="sm" onPress={() => void select(failedEmail)} />}
    </>}
  </AppCard>;
}

const styles = StyleSheet.create({ card: { gap: spacing.sm }, account: { gap: spacing.xxs } });
