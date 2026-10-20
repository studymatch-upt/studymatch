import { useRouter } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { ProgressBar } from '@/components/ProgressBar';
import { LabeledCompetencyRadar, competencyAxes } from '@/features/student/CompetencyRadar';
import { selectCompetencyProfile } from '@/features/student/competencyProfile';
import { useDemoSession } from '@/features/student/DemoSession';
import { demoStudent } from '@/features/student/data';
import { competencies } from '@/features/student/questionnaire';
import { StudentIcon } from '@/features/student/StudentIcon';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';
import { useTheme } from '@/theme/ThemeProvider';
import { dimensions, radius, spacing } from '@/theme/tokens';

const titles = Object.fromEntries(competencies.map(({ key, title }) => [key, title]));

export default function Competencies() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors } = useTheme();
  const { record, identity, goToStep } = useDemoSession();
  const profile = selectCompetencyProfile(record);
  const scores = profile?.scores;
  const radarSize = Math.min(210, Math.max(144, width - 160));
  const name = identity?.name || demoStudent.name;
  const exampleName = !identity?.name;

  return <StudentPage detail compactHeader title="Competências">
    <AppCard style={styles.identityCard}>
      <View style={[styles.avatar, { backgroundColor: colors.surfaceRaised }]}><StudentIcon name="profile" color={colors.accentText} size={22} /></View>
      <View style={styles.identityCopy}>
        <AppText variant="label" numberOfLines={1}>{name}</AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>Engenharia Informática · exemplo</AppText>
        <AppText variant="caption" tone="accent">{exampleName ? 'IDENTIDADE DE EXEMPLO' : 'AUTOAVALIAÇÃO LOCAL'}</AppText>
      </View>
      <View style={styles.overall}>
        <AppText variant="heading" tone="accent">—</AppText>
        <AppText variant="caption" tone="secondary" style={styles.overallLabel}>OVERALL</AppText>
      </View>
    </AppCard>

    <AppCard style={styles.card}>
      <View style={studentStyles.spread}>
        <AppText variant="label" accessibilityRole="header">Radar de competências</AppText>
        <AppText variant="caption" tone="accent">{profile?.source === 'official' ? 'Perfil académico' : 'Autoavaliação'}</AppText>
      </View>
      <LabeledCompetencyRadar size={radarSize} scores={scores} />
    </AppCard>

    <AppCard style={styles.card}>
      <AppText variant="label" accessibilityRole="header">Detalhe dos atributos</AppText>
      <View style={styles.bars}>{competencyAxes.map((key) => {
        const score = scores?.[key];
        return <View key={key} style={styles.bar}>
          <View style={studentStyles.spread}>
            <AppText variant="caption" numberOfLines={1} style={styles.barLabel}>{titles[key]}</AppText>
            <AppText variant="caption" tone="accent">{score === undefined ? 'Sem dados' : `${Math.round(score)}%`}</AppText>
          </View>
          <ProgressBar value={score ?? 0} />
        </View>;
      })}</View>
    </AppCard>

    <AppCard style={styles.card}>
      <AppText variant="label" accessibilityRole="header">Origem das pontuações</AppText>
      {profile?.source === 'official' && profile.questionnaireWeight !== null && profile.academicWeight !== null ? <>
        <View style={[styles.weightTrack, { backgroundColor: colors.track }]}>
          <View style={{ width: `${Math.round(profile.questionnaireWeight * 100)}%`, height: '100%', backgroundColor: colors.primaryBright }} />
        </View>
        <View style={studentStyles.spread}>
          <AppText variant="caption" tone="accent">{Math.round(profile.questionnaireWeight * 100)}% Questionário</AppText>
          <AppText variant="caption" tone="secondary">{Math.round(profile.academicWeight * 100)}% Notas</AppText>
        </View>
        {profile.unknownCompetencies.length > 0 && <AppText variant="caption" tone="secondary">{profile.unknownCompetencies.length} áreas ainda sem dados.</AppText>}
      </> : <>
        <View style={[styles.weightTrack, { backgroundColor: colors.track }]} />
        <View style={studentStyles.spread}>
          <AppText variant="caption" tone="accent">Questionário · local</AppText>
          <AppText variant="caption" tone="secondary">Notas · sem dados</AppText>
        </View>
        <AppText variant="caption" tone="secondary">Autoavaliação guardada neste dispositivo. Ainda sem dados académicos combinados nem nota Overall.</AppText>
      </>}
    </AppCard>

    <AppButton title="Rever ou refazer questionário" variant="outline" size="sm" onPress={() => { goToStep(0); router.push('/student/questionnaire'); }} />
    <AppButton title="Ir para o início" variant="secondary" size="sm" onPress={() => router.replace('/student')} />
  </StudentPage>;
}

const styles = StyleSheet.create({
  identityCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  avatar: { width: dimensions.controlSm, height: dimensions.controlSm, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1, minWidth: 0, gap: 1 },
  overall: { alignItems: 'center', justifyContent: 'center', minWidth: 48 },
  overallLabel: { fontSize: 9 },
  card: { gap: spacing.md },
  bars: { gap: spacing.sm },
  bar: { gap: spacing.xxs },
  barLabel: { flex: 1 },
  weightTrack: { width: '100%', height: 7, borderRadius: radius.pill, overflow: 'hidden' },
});
