import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { CalendarCard } from '@/features/student/CalendarCard';
import { demoGroups, demoProjects, demoStudent } from '@/features/student/data';
import { StudentIcon, type StudentIconName } from '@/features/student/StudentIcon';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';
import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, radius, spacing } from '@/theme/tokens';

export default function StudentHome() {
  const router = useRouter();
  const { colors } = useTheme();
  const stats: { title: string; count: number; icon: StudentIconName }[] = [
    { title: 'Grupos ativos', count: demoGroups.filter((g) => g.status === 'active').length, icon: 'groups' },
    { title: 'Inscrições', count: demoProjects.filter((p) => p.status === 'enrolled').length, icon: 'projects' },
    { title: 'Concluídos', count: demoGroups.filter((g) => g.status === 'completed').length, icon: 'calendar' },
  ];
  return (
    <StudentPage title={`Olá, ${demoStudent.firstName}!`} subtitle={`${demoStudent.course} · O teu espaço académico`}>
      <AppCard style={studentStyles.stack}>
        <AppText variant="label" accessibilityRole="header">O teu perfil de competências</AppText>
        <View style={studentStyles.row}>
          <View style={[styles.radar, { backgroundColor: colors.surfaceRaised, borderColor: colors.border }]} accessibilityLabel="Espaço reservado para o radar de competências">
            <View style={[styles.radarInner, { borderColor: colors.accentText }]} />
            <View style={[styles.radarDot, { backgroundColor: colors.primaryBright }]} />
          </View>
          <View style={[studentStyles.copy, studentStyles.flex]}>
            <AppText variant="label">As tuas competências</AppText>
            <AppText variant="caption" tone="secondary">6 áreas para conheceres melhor o teu potencial.</AppText>
          </View>
        </View>
        <AppButton title="Ver competências" variant="secondary" size="sm" onPress={() => router.push('/student/competencies')} />
      </AppCard>
      <View style={studentStyles.stack}>
        <View style={studentStyles.spread}>
          <AppText variant="label" accessibilityRole="header">A tua atividade</AppText>
          <AppText variant="caption" tone="secondary">Dados de exemplo</AppText>
        </View>
        {stats.every((s) => s.count === 0) ? <EmptyState title="Tudo começa aqui" description="Os teus projetos e grupos vão aparecer neste resumo." /> : (
          <View style={styles.stats}>
            {stats.map((stat) => <AppCard key={stat.title} style={styles.stat}>
              <StudentIcon name={stat.icon} color={colors.accentText} size={18} />
              <AppText variant="heading">{stat.count}</AppText>
              <AppText variant="caption" tone="secondary" style={styles.center}>{stat.title}</AppText>
            </AppCard>)}
          </View>
        )}
      </View>
      <CalendarCard />
    </StudentPage>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  stat: { flex: 1, minWidth: 80, alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.xs },
  center: { textAlign: 'center' },
  radar: { width: 64, height: 64, borderWidth: borderWidth.thin, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  radarInner: { width: 32, height: 32, borderWidth: borderWidth.thin, borderRadius: radius.sm, transform: [{ rotate: '45deg' }] },
  radarDot: { position: 'absolute', width: spacing.xxs, height: spacing.xxs, borderRadius: radius.pill },
});
