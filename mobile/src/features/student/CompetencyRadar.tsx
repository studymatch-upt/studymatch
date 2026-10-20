import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import type { CompetencyScores } from './competencyProfile';
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
type Point = { x: number; y: number };

function vertex(index: number, radius: number, center: number) {
  const angle = index * Math.PI / 3 - Math.PI / 2;
  return { x: center + radius * Math.cos(angle), y: center + radius * Math.sin(angle) };
}

function Segment({ from, to, color, width = 1.2 }: { from: { x: number; y: number }; to: { x: number; y: number }; color: string; width?: number }) {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return <View style={{ position: 'absolute', left: (from.x + to.x - length) / 2, top: (from.y + to.y - width) / 2, width: length, height: width, borderRadius: width, backgroundColor: color, transform: [{ rotate: `${Math.atan2(to.y - from.y, to.x - from.x)}rad` }] }} />;
}

// Horizontal strips fill the six-sided polygon using native Views, with no added dependency.
function fillStrips(points: Point[], color: string) {
  const rows = [];
  for (let y = Math.min(...points.map((point) => point.y)); y <= Math.max(...points.map((point) => point.y)); y += 2) {
    const intersections: number[] = [];
    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      if ((point.y <= y && next.y > y) || (next.y <= y && point.y > y)) {
        intersections.push(point.x + (y - point.y) * (next.x - point.x) / (next.y - point.y));
      }
    });
    intersections.sort((a, b) => a - b);
    for (let i = 0; i + 1 < intersections.length; i += 2) {
      rows.push(<View key={`${y}-${i}`} style={{ position: 'absolute', left: intersections[i], top: y, width: intersections[i + 1] - intersections[i], height: 2, backgroundColor: color }} />);
    }
  }
  return rows;
}

// Keep unknown competencies unplotted; zero is reserved for a known 0% score.
export function CompetencyRadar({ size = 96, scores }: { size?: number; scores?: CompetencyScores }) {
  const { colors } = useTheme();
  const center = size / 2;
  const outer = center - 5;
  const points = competencyAxes.map((_, i) => vertex(i, outer, center));
  const dataPoints = competencyAxes.map((key, i) => {
    const score = scores?.[key];
    return score !== undefined && Number.isFinite(score) && score >= 0 && score <= 100
      ? vertex(i, outer * score / 100, center) : null;
  });
  const knownCount = dataPoints.filter((point) => point !== null).length;
  const complete = knownCount === competencyAxes.length;
  return (
    <View accessibilityRole="image" accessibilityLabel={knownCount === 0 ? 'Radar sem pontuações disponíveis' : `Radar com ${knownCount} competências conhecidas em seis eixos`} style={[styles.container, { width: size, height: size }]}>
      {complete && fillStrips(dataPoints.filter((point): point is Point => point !== null), `${colors.primaryBright}30`)}
      {[1 / 3, 2 / 3, 1].flatMap((level) => points.map((_, i) => <Segment key={`${level}-${i}`} from={vertex(i, outer * level, center)} to={vertex((i + 1) % 6, outer * level, center)} color={colors.border} />))}
      {points.map((point, i) => <Segment key={`axis-${i}`} from={{ x: center, y: center }} to={point} color={colors.border} />)}
      {dataPoints.map((point, i) => point && dataPoints[(i + 1) % 6] ? <Segment key={`score-${i}`} from={point} to={dataPoints[(i + 1) % 6]!} color={colors.primaryBright} width={2} /> : null)}
      {dataPoints.map((point, i) => point ? <View key={`dot-${i}`} style={[styles.dot, { left: point.x - 2, top: point.y - 2, backgroundColor: colors.primaryBright }]} /> : null)}
    </View>
  );
}

export function LabeledCompetencyRadar({ size, scores }: { size: number; scores?: CompetencyScores }) {
  return <View style={{ width: size + 80, height: size + 52, alignSelf: 'center' }}>
    <View style={{ position: 'absolute', left: 40, top: 20 }}><CompetencyRadar size={size} scores={scores} /></View>
    <AppText variant="caption" tone="secondary" style={[styles.label, { left: size / 2 + 5, top: 0 }]}>Programação</AppText>
    <AppText variant="caption" tone="secondary" style={[styles.label, { right: 0, top: size * 0.26 }]}>Organização</AppText>
    <AppText variant="caption" tone="secondary" style={[styles.label, { right: 0, top: size * 0.76 }]}>Matemática</AppText>
    <AppText variant="caption" tone="secondary" style={[styles.label, { left: size / 2 + 5, bottom: 0 }]}>Comunicação</AppText>
    <AppText variant="caption" tone="secondary" style={[styles.label, { left: 0, top: size * 0.76 }]}>Bases de Dados</AppText>
    <AppText variant="caption" tone="secondary" style={[styles.label, { left: 0, top: size * 0.26 }]}>Design & UX</AppText>
  </View>;
}

const styles = StyleSheet.create({ container: { alignItems: 'center', justifyContent: 'center' }, dot: { position: 'absolute', width: 4, height: 4, borderRadius: 2 }, label: { position: 'absolute', width: 70, textAlign: 'center', fontSize: 10 } });
