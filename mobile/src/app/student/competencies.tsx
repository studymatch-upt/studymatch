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
import { OfficialDataStatus } from '@/features/student/OfficialDataStatus';
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
  const { record, identity, official, goToStep } = useDemoSession();
  const profile = selectCompetencyProfile(record, official?.profile, official?.student.id);
  const scores = profile?.scores;
  // Screen and card gutters leave 80 pt for the six labels around the chart.
  const radarSize = Math.min(210, Math.max(96, width - 168));
  const name = official?.student.name ?? identity?.name ?? demoStudent.name;
  const exampleName = !official && !identity?.name;

  return <StudentPage detail compactHeader title="Competências">
    <OfficialDataStatus />
    <AppCard style={styles.identityCard}>
      <View style={[styles.avatar, { backgroundColor: colors.surfaceRaised }]}><StudentIcon name="profile" color={colors.accentText} size={22} /></View>
      <View style={styles.identityCopy}>
        <AppText variant="label" numberOfLines={1}>{name}</AppText>
        <AppText variant="caption" tone="secondary" numberOfLines={1}>{official ? [official.student.studentNumber && `N.º ${official.student.studentNumber}`, official.student.curricularYear && `${official.student.curricularYear}.º ano`].filter(Boolean).join(' · ') || 'Dados académicos do backend' : 'Engenharia Informática · exemplo'}</AppText>
        <AppText variant="caption" tone="accent">{official ? 'PERFIL OFICIAL DO BACKEND' : exampleName ? 'IDENTIDADE DE EXEMPLO' : 'AUTOAVALIAÇÃO LOCAL'}</AppText>
      </View>
      <View style={styles.overall}>
        <AppText variant="heading" tone="accent">{profile?.overallScore == null ? '—' : Math.round(profile.overallScore)}</AppText>
        <AppText variant="caption" tone="secondary" style={styles.overallLabel}>OVERALL</AppText>
      </View>
    </AppCard>

    <AppCard style={styles.card}>
      <View style={studentStyles.spread}>
        <AppText variant="label" accessibilityRole="header">Radar de competências</AppText>
        <AppText variant="caption" tone="accent">{profile?.source === 'official' ? 'Perfil académico' : 'Autoavaliação'}</AppText>
      </View>
      <LabeledCompetencyRadar size={radarSize} scores={scores} />
      {official && Object.keys(scores ?? {}).length === 0 && <AppText variant="caption" tone="secondary">Ainda não há pontuações oficiais para este aluno.</AppText>}
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
      <AppText variant="label" accessibilityRole="header">Origem do perfil</AppText>
      {profile?.source === 'official' && profile.questionnaireWeight !== null && profile.academicWeight !== null ? <>
        <View accessible accessibilityRole="image" accessibilityLabel={`${Math.round(profile.questionnaireWeight * 100)} por cento questionário, ${Math.round(profile.academicWeight * 100)} por cento notas académicas`} style={[styles.weightTrack, { backgroundColor: colors.track }]}>
          <View style={{ width: `${profile.questionnaireWeight * 100}%`, height: '100%', backgroundColor: colors.primaryBright }} />
          <View style={{ width: `${profile.academicWeight * 100}%`, height: '100%', backgroundColor: colors.textSecondary }} />
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.primaryBright }]} />
            <AppText variant="caption">Questionário · {Math.round(profile.questionnaireWeight * 100)}%</AppText>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.textSecondary }]} />
            <AppText variant="caption">Notas · {Math.round(profile.academicWeight * 100)}%</AppText>
          </View>
        </View>
        <AppText variant="caption" tone="secondary">Ponderação calculada pelo backend.</AppText>
        {profile.unknownCompetencies.length > 0 && <AppText variant="caption" tone="secondary">{profile.unknownCompetencies.length} áreas ainda sem dados.</AppText>}
      </> : <>
        <AppText variant="label" tone="accent">Autoavaliação local</AppText>
        <AppText variant="caption" tone="secondary">Dados académicos ainda não associados.</AppText>
        <AppText variant="caption" tone="secondary">O radar mostra apenas as tuas respostas guardadas neste dispositivo.</AppText>
      </>}
    </AppCard>

    {official ? <AppCard style={styles.card}>
      <AppText variant="label">Questionário do backend</AppText>
      <AppText variant="caption" tone="secondary">{Object.keys(official.questionnaire.answers).length} de 6 áreas com resposta oficial. A autoavaliação local permanece separada.</AppText>
    </AppCard> : <AppButton title="Rever ou refazer questionário" variant="outline" size="sm" onPress={() => { goToStep(0); router.push('/student/questionnaire'); }} />}
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
  weightTrack: { width: '100%', height: 8, borderRadius: radius.pill, overflow: 'hidden', flexDirection: 'row' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: spacing.xs, height: spacing.xs, borderRadius: radius.pill },
});
