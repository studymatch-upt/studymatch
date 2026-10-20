import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = { message?: string };

export function LoadingState({ message = 'A carregar...' }: Props) {
  const { colors } = useTheme();

  return (
    <View accessibilityRole="progressbar" accessibilityLabel={message} style={styles.container}>
      <ActivityIndicator color={colors.primaryBright} />
      <AppText variant="caption" tone="secondary">{message}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
});
