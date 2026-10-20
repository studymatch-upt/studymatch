import type { PropsWithChildren, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { EntryHeader } from '@/components/EntryHeader';
import { spacing } from '@/theme/tokens';

export function StudentPage({ title, subtitle, detail = false, compactHeader = false, headerAccessory, children }: PropsWithChildren<{ title: string; subtitle?: string; detail?: boolean; compactHeader?: boolean; headerAccessory?: ReactNode }>) {
  return (
    <Screen edges={detail ? undefined : ['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        {detail && <EntryHeader back backTo="/student" label="STUDYMATCH" />}
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <AppText variant={compactHeader ? 'heading' : 'title'} accessibilityRole="header">{title}</AppText>
            {subtitle && <AppText variant="caption" tone="secondary">{subtitle}</AppText>}
          </View>
          {headerAccessory}
        </View>
        {children}
      </ScrollView>
    </Screen>
  );
}

export const studentStyles = StyleSheet.create({
  stack: { gap: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  spread: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  flex: { flex: 1 },
  copy: { gap: spacing.xxs },
});
const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing.lg },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  header: { gap: spacing.xxs },
});
