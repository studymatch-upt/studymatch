import { Redirect, useRouter } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { useDemoSession } from '@/features/student/DemoSession';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';

export default function QuestionnaireComplete() {
  const router = useRouter();
  const { record } = useDemoSession();
  if (!record.completed) return <Redirect href="/student/questionnaire" />;
  return <StudentPage title="Questionário concluído" subtitle="As 18 respostas foram guardadas neste dispositivo." detail>
      <AppCard style={studentStyles.stack}>
        <AppText variant="heading">A tua autoavaliação está pronta</AppText>
        <AppText tone="secondary">Podes rever as respostas e explorar as seis áreas de competências. O radar visual e o cálculo com o percurso académico serão adicionados numa próxima etapa.</AppText>
        <AppText variant="caption" tone="secondary">Resultado local de demonstração, sem validação académica ou ligação ao servidor.</AppText>
      </AppCard>
      <AppButton title="Explorar o meu perfil" onPress={() => router.replace('/student/competencies')} />
  </StudentPage>;
}
