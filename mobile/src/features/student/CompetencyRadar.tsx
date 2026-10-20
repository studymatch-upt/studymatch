import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export const competencyAxes = [
  'PROGRAMMING',
  'ORGANISATION_AND_LEADERSHIP',
  'MATHEMATICS_AND_LOGIC',
  'COMMUNICATION',
  'DATABASES',
  'DESIGN_AND_UX',
] as const;

export type CompetencyKey = typeof competencyAxes[number];
export type CompetencyScores = Partial<Record<CompetencyKey, number>>;

function vertex(index: number, radius: number, center: number) {
  const angle = index * Math.PI / 3 - Math.PI / 2;
  return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
}

function Segment({ from, to, color, width = 1.2 }: { from: { x: number; y: number }; to: { x: number; y: number }; color: string; width?: number }) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return <View style={{ position: 'absolute', left: (from.x + to.x - length) / 2, top: (from.y + to.y - width) / 2, width: length, height: width, borderRadius: width, backgroundColor: color, transform: [{ rotate: `${Math.atan2(to.y - from.y, to.x - from.x)}rad` }] }} />;
}

// The six-axis grid is always visible; a data polygon appears only with six known scores.
export function CompetencyRadar({ size = 96, scores }: { size?: number; scores?: CompetencyScores }) {
  const { colors } = useTheme();
  const center = size / 2;
  const outer = center - 5;
  const points = competencyAxes.map((_, i) => vertex(i, outer, center));
  const complete = scores && competencyAxes.every((key) => Number.isFinite(scores[key]) && scores[key]! >= 0 && scores[key]! <= 100);
  const dataPoints = complete ? competencyAxes.map((key, i) => vertex(i, outer * scores[key]! / 100, center)) : null;
  return (
    <View accessibilityRole="image" accessibilityLabel={complete ? 'Radar das seis competências' : 'Radar sem pontuações disponíveis'} style={[styles.container, { width: size, height: size }]}>
      {[1 / 3, 2 / 3, 1].flatMap((level) => points.map((_, i) => <Segment key={`${level}-${i}`} from={vertex(i, outer * level, center)} to={vertex((i + 1) % 6, outer * level, center)} color={colors.border} />))}
      {points.map((point, i) => <Segment key={`axis-${i}`} from={{ x: center, y: center }} to={point} color={colors.border} />)}
      {dataPoints?.map((point, i) => <Segment key={`score-${i}`} from={point} to={dataPoints[(i + 1) % 6]} color={colors.primaryBright} width={2} />)}
      {dataPoints?.map((point, i) => <View key={`dot-${i}`} style={[styles.dot, { left: point.x - 2, top: point.y - 2, backgroundColor: colors.primaryBright }]} />)}
    </View>
  );
}

const styles = StyleSheet.create({ container: { alignItems: 'center', justifyContent: 'center' }, dot: { position: 'absolute', width: 4, height: 4, borderRadius: 2 } });
