import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { BrandMark } from '@/components/BrandMark';
import { CalendarCard } from '@/features/student/CalendarCard';
import { CompetencyRadar } from '@/features/student/CompetencyRadar';
import { selectCompetencyProfile } from '@/features/student/competencyProfile';
import { useDemoSession } from '@/features/student/DemoSession';
import { demoStudent } from '@/features/student/data';
import { StudentIcon, type StudentIconName } from '@/features/student/StudentIcon';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';
import { useTheme } from '@/theme/ThemeProvider';
import { dimensions, opacity, radius, spacing } from '@/theme/tokens';

const activity: { title: string; icon: StudentIconName; path: '/student/groups' | '/student/projects' }[] = [
  { title: 'Grupos ativos', icon: 'groups', path: '/student/groups' },
  { title: 'Inscrições', icon: 'projects', path: '/student/projects' },
  { title: 'Concluídos', icon: 'calendar', path: '/student/groups' },
];

export default function StudentHome() {
  const router = useRouter();
  const { colors } = useTheme();
  const { record, identity } = useDemoSession();
  const profile = selectCompetencyProfile(record);
  return (
    <StudentPage compactHeader title={identity?.name ? `Olá, ${identity.name.split(' ')[0]}!` : 'Olá!'} subtitle={`${demoStudent.course} · exemplo`} headerAccessory={<View accessibilityLabel="StudyMatch"><BrandMark size={dimensions.symbol} /></View>}>
      <Pressable accessibilityRole="button" accessibilityLabel="Ver perfil de competências" onPress={() => router.push('/student/competencies')} style={({ pressed }) => pressed && styles.pressed}>
        <AppCard style={styles.overall}>
          <View style={studentStyles.spread}>
            <View style={studentStyles.copy}>
              <AppText variant="label">Overall · {profile?.overallScore == null ? '—' : Math.round(profile.overallScore)}</AppText>
              <AppText variant="caption" tone="secondary">Perfil de competências</AppText>
            </View>
            <AppText variant="caption" tone="accent">Ver perfil ↗</AppText>
          </View>
          <View style={styles.radarRow}>
            <View style={[styles.radarBox, { backgroundColor: colors.surfaceRaised }]}>
              <CompetencyRadar size={82} scores={profile?.scores} />
            </View>
            <View style={[studentStyles.copy, studentStyles.flex]}>
              <AppText variant="label" numberOfLines={1}>{identity?.name || `${demoStudent.name} · exemplo`}</AppText>
              <AppText variant="caption" tone="secondary">{profile?.source === 'official' ? 'Perfil académico' : 'Autoavaliação local'} · seis competências</AppText>
              <AppText variant="caption" tone="secondary">Sem nota global oficial</AppText>
            </View>
          </View>
        </AppCard>
      </Pressable>
      <View style={studentStyles.stack}>
        <AppText variant="label" accessibilityRole="header">A tua atividade</AppText>
        <View style={styles.stats}>
          {activity.map((item) => <Pressable key={item.title} accessibilityRole="button" accessibilityLabel={`${item.title}, sem dados disponíveis. Abrir ${item.path === '/student/groups' ? 'Grupos' : 'Projetos'}`} onPress={() => router.push(item.title === 'Concluídos' ? '/student/groups?status=completed' : item.path)} style={({ pressed }) => [styles.statAction, pressed && styles.pressed]}>
            <AppCard style={styles.stat}>
              <StudentIcon name={item.icon} color={colors.accentText} size={18} />
              <AppText variant="heading" accessibilityLabel="Sem dados disponíveis">—</AppText>
              <AppText variant="caption" tone="secondary" style={styles.center}>{item.title}</AppText>
            </AppCard>
          </Pressable>)}
        </View>
      </View>
      <CalendarCard />
    </StudentPage>
  );
}

const styles = StyleSheet.create({
  overall: { gap: spacing.sm, paddingVertical: spacing.sm },
  radarRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  radarBox: { width: 88, height: 88, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: spacing.xs },
  statAction: { flex: 1, minWidth: 0 },
  stat: { height: 104, alignItems: 'center', justifyContent: 'center', gap: spacing.xxs, paddingHorizontal: spacing.xxs, paddingVertical: spacing.xs },
  center: { textAlign: 'center' },
  pressed: { opacity: opacity.pressed },
});
