import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { colors } from '@/theme/colors';

export default function HomeScreen() {
  return (
    <Screen>
      <View style={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          StudyMatch
        </Text>
        <Text style={styles.subtitle}>Base da aplicação mobile</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 8,
  },
});
