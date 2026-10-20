import { StyleSheet, View } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';
import { StudentIcon } from './StudentIcon';
import { studentStyles } from './StudentPage';

const weekdays = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

export function CalendarCard() {
  const { colors } = useTheme();
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((offset + days) / 7) * 7;
  return (
    <AppCard style={studentStyles.stack}>
      <View style={studentStyles.row}>
        <StudentIcon name="calendar" color={colors.accentText} size={20} />
        <AppText variant="label" accessibilityRole="header">Calendário</AppText>
      </View>
      <AppText variant="label" style={styles.month}>{today.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</AppText>
      <View style={styles.grid}>
        {weekdays.map((day, i) => <View key={`weekday-${i}`} style={styles.cell}><AppText variant="caption" tone="secondary">{day}</AppText></View>)}
        {Array.from({ length: cellCount }, (_, i) => {
          const day = i - offset + 1;
          const valid = day > 0 && day <= days;
          const current = valid && day === today.getDate();
          return (
            <View key={i} style={styles.cell}>
              {valid && <View style={[styles.day, current && { backgroundColor: colors.primary }]}>
                <AppText variant="caption" tone={current ? 'inverse' : 'primary'} accessibilityLabel={`${day} de ${today.toLocaleDateString('pt-PT', { month: 'long' })}${current ? ', hoje' : ''}`}>{day}</AppText>
              </View>}
            </View>
          );
        })}
      </View>
      <AppText variant="caption" tone="secondary">Sem eventos nesta demonstração. Os teus prazos vão aparecer aqui.</AppText>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  month: { textTransform: 'capitalize' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: '14.285714%', minHeight: 36, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxs },
  day: { minWidth: 28, minHeight: 28, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
});
