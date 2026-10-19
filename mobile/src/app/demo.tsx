import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { BrandMark } from '@/components/BrandMark';
import { EntryHeader } from '@/components/EntryHeader';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, radius, spacing } from '@/theme/tokens';

export default function DemoScreen() {
  const router = useRouter();
  const { role } = useLocalSearchParams<{ role?: string }>();
  const { colors } = useTheme();
  const profile = role === 'professor' ? 'Professor' : role === 'aluno' ? 'Aluno' : null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <EntryHeader back backTo="/choose-profile" label="STUDYMATCH" />
        <View style={styles.main}>
          <View style={[styles.mark, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <BrandMark size={72} />
          </View>
          <View style={styles.copy}>
            <AppText variant="caption" tone="accent">EXPERIÊNCIA DEMONSTRATIVA</AppText>
            <AppText variant="title" accessibilityRole="header" style={styles.center}>
              {profile ? `Perfil de ${profile}` : 'Escolhe um perfil'}
            </AppText>
            <AppText tone="secondary" style={styles.center}>
              {profile
                ? 'A experiência completa deste perfil será implementada num próximo Issue.'
                : 'Volta ao ecrã anterior para escolheres uma experiência.'}
            </AppText>
          </View>
        </View>
        <AppButton title="Voltar ao login" variant="secondary" onPress={() => router.dismissTo('/login')} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'space-between', paddingTop: spacing.sm, paddingBottom: spacing.xl },
  main: { alignItems: 'center', gap: spacing.xxl },
  mark: { width: 144, height: 144, borderRadius: radius.pill, borderWidth: borderWidth.thin, alignItems: 'center', justifyContent: 'center' },
  copy: { alignItems: 'center', gap: spacing.sm },
  center: { textAlign: 'center' },
});
