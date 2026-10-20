import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/AppText';
import { Screen } from '@/components/Screen';
import { EntryHeader } from '@/components/EntryHeader';
import { spacing } from '@/theme/tokens';

export function StudentPage({ title, subtitle, detail = false, compactHeader = false, keyboardAware = false, headerAccessory, children }: PropsWithChildren<{ title: string; subtitle?: string; detail?: boolean; compactHeader?: boolean; keyboardAware?: boolean; headerAccessory?: ReactNode }>) {
  return (
    <Screen edges={detail ? undefined : ['top', 'left', 'right']}>
      <KeyboardAvoidingView style={styles.fill} enabled={keyboardAware} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets={!keyboardAware}>
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
      </KeyboardAvoidingView>
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
  fill: { flex: 1 },
  content: { flexGrow: 1, gap: spacing.md, paddingTop: spacing.xs, paddingBottom: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  header: { flex: 1, minWidth: 0, gap: spacing.xxs },
});
