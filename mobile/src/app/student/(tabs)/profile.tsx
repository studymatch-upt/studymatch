import { StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { useDemoSession } from '@/features/student/DemoSession';
import { demoStudent } from '@/features/student/data';
import { gradeSummary } from '@/features/student/academicGrades';
import { OfficialDataStatus } from '@/features/student/OfficialDataStatus';
import { StudentIcon } from '@/features/student/StudentIcon';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';
import { useTheme } from '@/theme/ThemeProvider';
import { dimensions, radius, spacing } from '@/theme/tokens';

export default function Profile() {
  const router = useRouter();
  const { colors, resolvedTheme, setPreference } = useTheme();
  const { setStudentActive, record, goToStep, official, identity } = useDemoSession();
  const student = official?.student;
  const name = student?.name ?? identity?.name ?? demoStudent.name;
  const year = student
    ? student.curricularYear ? `${student.curricularYear}.º ano` : 'Ano curricular não indicado'
    : identity?.curricularYear ? `${identity.curricularYear}.º ano` : demoStudent.year;
  const average = official ? gradeSummary(official.enrollments) : null;

  return <StudentPage title="Perfil" compactHeader>
    <OfficialDataStatus />
    <View style={studentStyles.row}>
      <View style={[styles.avatar, { backgroundColor: colors.surfaceRaised }]}><StudentIcon name="profile" color={colors.accentText} /></View>
      <View style={[studentStyles.copy, studentStyles.flex]}>
        <AppText variant="heading">{name}</AppText>
        <AppText variant="caption" tone="secondary">{student ? 'Aluno de teste · dados do backend' : `${demoStudent.course} · exemplo`}</AppText>
        <AppText variant="caption" tone="secondary">{year}</AppText>
      </View>
    </View>
    <AppCard style={styles.card}>
      <AppText variant="label" accessibilityRole="header">Informação pessoal</AppText>
      <View style={styles.detailRow}>
        <AppText variant="caption" tone="secondary">Email</AppText>
        <AppText variant="label" selectable>{student?.email ?? identity?.email ?? 'Não indicado'}</AppText>
      </View>
      <View style={styles.detailRow}>
        <AppText variant="caption" tone="secondary">Número de aluno</AppText>
        <AppText variant="label">{student ? student.studentNumber ?? 'Não indicado' : identity?.studentNumber ? `${identity.studentNumber} · demonstração` : identity ? 'Não indicado' : `${demoStudent.number} · exemplo`}</AppText>
      </View>
    </AppCard>
    <AppCard style={styles.card}>
      <AppText variant="label" accessibilityRole="header">Percurso académico</AppText>
      <AppText variant="caption" tone="secondary">{official
        ? `${average?.count ?? 0} ${(average?.count ?? 0) === 1 ? 'cadeira avaliada' : 'cadeiras avaliadas'} · ${Object.keys(official.questionnaire.answers).length} de 6 áreas do questionário`
        : record.completed ? 'Autoavaliação local concluída · 18 respostas' : 'Questionário por concluir'}</AppText>
      <View style={styles.actions}>
        <AppButton title="Competências" size="sm" variant="secondary" style={styles.action} onPress={() => router.push('/student/competencies')} />
        <AppButton title="Notas" size="sm" variant="secondary" style={styles.action} onPress={() => router.push('/student/grades')} />
      </View>
      {!official && <AppButton title="Rever questionário" size="sm" variant="outline" onPress={() => { goToStep(0); router.push('/student/questionnaire'); }} />}
    </AppCard>
    <AppCard style={styles.themeCard}>
      <View style={[studentStyles.spread, studentStyles.flex]}>
        <View style={studentStyles.copy}>
          <AppText variant="label">Modo escuro</AppText>
          <AppText variant="caption" tone="secondary">Preferência guardada neste dispositivo</AppText>
        </View>
        <Switch accessibilityLabel="Modo escuro" accessibilityRole="switch" value={resolvedTheme === 'dark'} onValueChange={(value) => setPreference(value ? 'dark' : 'light')} trackColor={{ false: colors.track, true: colors.primary }} thumbColor={colors.onPrimary} />
      </View>
    </AppCard>
    <AppButton title={official ? 'Trocar aluno de teste' : 'Terminar sessão demonstrativa'} variant="outline" size="sm" onPress={() => setStudentActive(false)} />
  </StudentPage>;
}

const styles = StyleSheet.create({
  avatar: { width: dimensions.controlMd, height: dimensions.controlMd, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  card: { gap: spacing.sm },
  detailRow: { gap: spacing.xxs },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1, minWidth: 0, paddingHorizontal: spacing.xs },
  themeCard: { paddingVertical: spacing.sm },
});
