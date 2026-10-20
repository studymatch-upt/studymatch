import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { useDemoSession } from '@/features/student/DemoSession';
import { answeredCount, competencies, scale, type Answer } from '@/features/student/questionnaire';
import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, radius, spacing } from '@/theme/tokens';

export default function Questionnaire() {
  const router = useRouter();
  const { colors } = useTheme();
  const { record, storageError, answerQuestion, goToStep, finishQuestionnaire, setStudentActive } = useDemoSession();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const step = record.step;
  const competency = competencies[step];
  const count = answeredCount(record.answers);
  const groupComplete = record.answers.slice(step * 3, step * 3 + 3).every((answer) => answer !== null);

  async function next() {
    if (!groupComplete) { setError('Responde às três perguntas desta área para continuar.'); return; }
    setError(null);
    if (step < 5) { goToStep(step + 1); return; }
    setSaving(true);
    try {
      await finishQuestionnaire();
      router.replace('/student/questionnaire-complete');
    } catch {
      setError('Não foi possível guardar o questionário. Tenta novamente.');
      setSaving(false);
    }
  }

  return <Screen>
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.top}>
        <View style={styles.copy}>
          <AppText variant="caption" tone="accent">STUDYMATCH · AUTOAVALIAÇÃO LOCAL</AppText>
          <AppText variant="title" accessibilityRole="header">Questionário de competências</AppText>
          <AppText tone="secondary">Indica até que ponto concordas com cada afirmação.</AppText>
        </View>
        <AppButton title="Sair" size="sm" variant="outline" onPress={() => setStudentActive(false)} />
      </View>
      <ProgressBar value={count / 18 * 100} label={`${count} de 18 respostas`} />
      <AppText variant="heading" accessibilityRole="header">{step + 1} de 6 · {competency.title}</AppText>
      <AppText variant="caption" tone="secondary">{competency.description}</AppText>
      {competency.questions.map((question, localIndex) => {
        const index = step * 3 + localIndex;
        const selected = record.answers[index];
        return <AppCard key={index} style={styles.card}>
          <AppText variant="label">{index + 1}. {question}</AppText>
          <View style={styles.scale}>{scale.map(({ value, label }) => <Pressable
            key={value}
            disabled={saving}
            accessibilityRole="radio"
            accessibilityLabel={`${value} de 5: ${label}`}
            accessibilityState={{ checked: selected === value }}
            onPress={() => { answerQuestion(index, value as Answer); setError(null); }}
            style={[styles.score, { borderColor: selected === value ? colors.primaryBright : colors.border, backgroundColor: selected === value ? colors.surfaceRaised : colors.background }]}
          ><AppText variant="label" tone={selected === value ? 'accent' : 'secondary'}>{value}</AppText></Pressable>)}</View>
          <AppText variant="caption" tone="secondary">1 = Discordo totalmente · 5 = Concordo totalmente</AppText>
        </AppCard>;
      })}
      {error && <AppText variant="caption" tone="secondary" accessibilityRole="alert">{error}</AppText>}
      {storageError && <AppText variant="caption" tone="secondary" accessibilityRole="alert">{storageError}</AppText>}
      <View style={styles.actions}>
        {step > 0 && <AppButton title="Anterior" variant="outline" style={styles.action} onPress={() => { goToStep(step - 1); setError(null); }} />}
        <AppButton title={step === 5 ? 'Concluir' : 'Continuar'} style={styles.action} loading={saving} onPress={next} />
      </View>
      <AppText variant="caption" tone="secondary">As respostas ficam neste dispositivo e não são enviadas para o servidor. Não representam uma avaliação académica oficial.</AppText>
    </ScrollView>
  </Screen>;
}

const styles = StyleSheet.create({
  page: { gap: spacing.lg, paddingVertical: spacing.lg },
  top: { gap: spacing.md },
  copy: { gap: spacing.xs },
  card: { gap: spacing.md },
  scale: { flexDirection: 'row', gap: spacing.xs },
  score: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderWidth: borderWidth.thin, borderRadius: radius.md },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
