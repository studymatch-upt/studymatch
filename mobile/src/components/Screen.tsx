import type { PropsWithChildren } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

type Props = PropsWithChildren<{ style?: StyleProp<ViewStyle>; edges?: Edge[] }>;

export function Screen({ children, style, edges }: Props) {
  const { colors, resolvedTheme } = useTheme();

  return (
    <SafeAreaView edges={edges} style={[styles.container, { backgroundColor: colors.background }, style]}>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
});
