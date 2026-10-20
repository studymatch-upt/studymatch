import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useDemoSession } from '@/features/student/DemoSession';
import { demoStudent } from '@/features/student/data';
import { OfficialDataStatus } from '@/features/student/OfficialDataStatus';
import { StudentIcon } from '@/features/student/StudentIcon';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';
import { dimensions, radius, spacing } from '@/theme/tokens';

const themes = [{ label: 'Sistema', value: 'system' }, { label: 'Claro', value: 'light' }, { label: 'Escuro', value: 'dark' }] as const;

export default function Profile() {
  const router = useRouter();
  const { colors, preference, setPreference } = useTheme();
  const { setStudentActive, record, goToStep, official } = useDemoSession();
  return (
    <StudentPage title="Perfil" subtitle={official ? 'Dados do aluno demonstrativo carregados do backend.' : 'Uma identidade de exemplo para explorares o StudyMatch.'}>
      <OfficialDataStatus />
      <View style={studentStyles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.surfaceRaised }]}><StudentIcon name="profile" color={colors.accentText} /></View>
        <View style={[studentStyles.copy, studentStyles.flex]}>
          <AppText variant="heading">{official?.student.name ?? demoStudent.name}</AppText>
          <AppText variant="caption" tone="secondary">{official ? official.student.email : demoStudent.course}</AppText>
          <AppText variant="caption" tone="secondary">{official ? (official.student.curricularYear ? `${official.student.curricularYear}.º ano` : 'Ano curricular não indicado') : demoStudent.year}</AppText>
        </View>
      </View>
      <AppCard style={studentStyles.stack}>
        <AppText variant="label" accessibilityRole="header">Informação pessoal</AppText>
        <View style={studentStyles.copy}>
          <AppText variant="caption" tone="secondary">{official ? 'Número de aluno' : 'Número de aluno · Exemplo'}</AppText>
          <AppText variant="label">{official?.student.studentNumber ?? demoStudent.number}</AppText>
        </View>
        <AppText variant="caption" tone="secondary">{official ? 'Aluno de teste. Estes dados são lidos do backend; esta sessão não autentica uma conta.' : 'Estes dados são fictícios. A edição do perfil estará disponível numa próxima fase.'}</AppText>
      </AppCard>
      {official ? <AppCard style={studentStyles.stack}>
        <AppText variant="label" accessibilityRole="header">Dados académicos disponíveis</AppText>
        <AppText variant="caption" tone="secondary">{official.enrollments.length} inscrições · {official.enrollments.filter((item) => item.grade !== null).length} registos com nota. O ecrã de Notas será desenvolvido numa etapa própria.</AppText>
        <AppText variant="caption" tone="secondary">Questionário oficial: {Object.keys(official.questionnaire.answers).length} de 6 áreas respondidas.</AppText>
      </AppCard> : <AppCard style={studentStyles.stack}>
        <AppText variant="label" accessibilityRole="header">Questionário de competências</AppText>
        <AppText variant="caption" tone="secondary">{record.completed ? '18 de 18 respostas guardadas neste dispositivo.' : 'Questionário por concluir.'} Esta é uma autoavaliação local de demonstração.</AppText>
        <AppButton title="Rever ou refazer respostas" variant="secondary" onPress={() => { goToStep(0); router.push('/student/questionnaire'); }} />
      </AppCard>}
      <AppCard style={studentStyles.stack}>
        <AppText variant="label" accessibilityRole="header">Aparência</AppText>
        <SegmentedControl<ThemePreference> label="Tema da aplicação" options={themes} value={preference} onChange={setPreference} />
        <AppText variant="caption" tone="secondary">A preferência de tema é guardada neste dispositivo.</AppText>
      </AppCard>
      <AppButton title="Terminar sessão demonstrativa" variant="outline" onPress={() => setStudentActive(false)} />
    </StudentPage>
  );
}

const styles = StyleSheet.create({ avatar: { width: dimensions.controlMd, height: dimensions.controlMd, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xs } });
