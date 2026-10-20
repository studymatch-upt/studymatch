import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { dimensions, opacity, radius, spacing } from '@/theme/tokens';
import { StudentIcon } from './StudentIcon';
import { localDay, monthRows, sameDay, weekFrom } from './calendarDates';
import { studentStyles } from './StudentPage';

const weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

export function CalendarCard() {
  const { colors } = useTheme();
  const [today] = useState(() => new Date());
  const [selected, setSelected] = useState(() => localDay(today.getFullYear(), today.getMonth(), today.getDate()));
  const [expanded, setExpanded] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => localDay(today.getFullYear(), today.getMonth(), 1));
  const rows = expanded ? monthRows(visibleMonth.getFullYear(), visibleMonth.getMonth()) : [weekFrom(selected)];

  function moveMonth(direction: number) {
    const next = localDay(visibleMonth.getFullYear(), visibleMonth.getMonth() + direction, 1);
    setVisibleMonth(next);
    setSelected(next);
  }

  return (
    <AppCard style={styles.card}>
      <View style={studentStyles.spread}>
        <View style={studentStyles.row}>
          <StudentIcon name="calendar" color={colors.accentText} size={18} />
          <AppText variant="label" accessibilityRole="header">Calendário</AppText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={expanded ? 'Recolher calendário' : 'Expandir calendário'} onPress={() => setExpanded((value) => !value)} hitSlop={spacing.xs} style={styles.smallAction}>
          <AppText variant="caption" tone="accent">{expanded ? 'Recolher' : 'Expandir'} {expanded ? '⌃' : '⌄'}</AppText>
        </Pressable>
      </View>
      <View style={studentStyles.spread}>
        <AppText variant="label" style={styles.month}>{visibleMonth.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}</AppText>
        {expanded && <View style={studentStyles.row}>
          <Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" hitSlop={spacing.xs} onPress={() => moveMonth(-1)} style={styles.monthAction}><AppText tone="accent">‹</AppText></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Mês seguinte" hitSlop={spacing.xs} onPress={() => moveMonth(1)} style={styles.monthAction}><AppText tone="accent">›</AppText></Pressable>
        </View>}
      </View>
      <View style={styles.calendar}>
        <View style={styles.week}>
          {weekdays.map((name) => <View key={name} style={styles.cell}><AppText variant="caption" tone="secondary" style={styles.center}>{name}</AppText></View>)}
        </View>
        {rows.map((row, i) => <View key={`week-${i}`} style={styles.week}>
          {row.map((date, column) => {
            const active = date ? sameDay(date, selected) : false;
            const current = date ? sameDay(date, today) : false;
            return <View key={column} style={styles.cell}>{date && <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}${current ? ', hoje' : ''}`}
              accessibilityState={{ selected: active }}
              onPress={() => { setSelected(date); setVisibleMonth(localDay(date.getFullYear(), date.getMonth(), 1)); }}
              style={({ pressed }) => [styles.day, active && { backgroundColor: colors.primary }, current && !active && { borderColor: colors.primaryBright, borderWidth: 1 }, pressed && styles.pressed]}
            >
              <AppText variant="caption" tone={active ? 'inverse' : 'primary'}>{date.getDate()}</AppText>
            </Pressable>}</View>;
          })}
        </View>)}
      </View>
      <AppText variant="caption" tone="secondary">Sem entregas para esta data</AppText>
      <View style={styles.legend} accessibilityLabel="Legenda de entregas">
        <View style={styles.legendItem}><AppText variant="caption" style={{ color: colors.warning.text }}>○</AppText><AppText variant="caption" tone="secondary">Por entregar</AppText></View>
        <View style={styles.legendItem}><AppText variant="caption" style={{ color: colors.success.text }}>✓</AppText><AppText variant="caption" tone="secondary">Concluído</AppText></View>
        <View style={styles.legendItem}><AppText variant="caption" style={{ color: colors.error.text }}>!</AppText><AppText variant="caption" tone="secondary">Em atraso</AppText></View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  smallAction: { minHeight: dimensions.controlSm, justifyContent: 'center' },
  month: { textTransform: 'capitalize' },
  monthAction: { minWidth: dimensions.controlSm, minHeight: dimensions.controlSm, alignItems: 'center', justifyContent: 'center' },
  calendar: { gap: spacing.xxs },
  week: { flexDirection: 'row', width: '100%' },
  cell: { flex: 1, minWidth: 0, minHeight: 34, alignItems: 'center', justifyContent: 'center' },
  day: { minWidth: 30, minHeight: 30, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm },
  center: { textAlign: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: spacing.sm, rowGap: spacing.xxs, paddingTop: spacing.xxs },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs },
  pressed: { opacity: opacity.pressed },
});
