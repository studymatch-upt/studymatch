import { useRouter } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { useDemoSession } from '@/features/student/DemoSession';
import { aggregateAnswers, competencies } from '@/features/student/questionnaire';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';

export default function Competencies() {
  const router = useRouter();
  const { record, goToStep } = useDemoSession();
  const answers = record.completed ? aggregateAnswers(record.answers) : null;
  return <StudentPage detail title="Competências" subtitle="A tua autoavaliação local nas seis áreas.">
    <AppCard style={studentStyles.stack}>
      <AppText variant="label" accessibilityRole="header">Respostas do questionário</AppText>
      <AppText variant="caption" tone="secondary">Média arredondada das três respostas de cada área, numa escala de 1 a 5. Estas pontuações não incluem o percurso académico e não são um perfil oficial.</AppText>
      {competencies.map(({ key, title }) => <AppText key={key} variant="body">{title}: {answers?.[key] ?? '—'} / 5</AppText>)}
    </AppCard>
    <AppButton title="Rever ou refazer questionário" variant="outline" onPress={() => { goToStep(0); router.push('/student/questionnaire'); }} />
    <AppButton title="Ir para o início" variant="secondary" onPress={() => router.replace('/student')} />
    <AppText variant="caption" tone="secondary">O radar visual e a pontuação Overall serão ligados a uma fonte de dados partilhada na próxima etapa.</AppText>
  </StudentPage>;
}
