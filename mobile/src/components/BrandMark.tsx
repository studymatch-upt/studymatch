import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { radius } from '@/theme/tokens';

type Props = { size?: number };

export function BrandMark({ size = 56 }: Props) {
  const { colors } = useTheme();

  return (
    <View accessibilityLabel="Símbolo StudyMatch" style={[styles.mark, { width: size, height: size }]}>
      <View style={[styles.link, styles.first, {
        width: size * 0.38,
        height: size * 0.7,
        borderWidth: size * 0.13,
        borderColor: colors.primary,
      }]} />
      <View style={[styles.link, styles.second, {
        width: size * 0.38,
        height: size * 0.7,
        borderWidth: size * 0.13,
        borderColor: colors.primaryBright,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
  link: { position: 'absolute', borderRadius: radius.pill },
  first: { transform: [{ translateX: -8 }, { translateY: 6 }, { rotate: '42deg' }] },
  second: { transform: [{ translateX: 8 }, { translateY: -6 }, { rotate: '42deg' }] },
});
