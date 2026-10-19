import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { EntryHeader } from '@/components/EntryHeader';
import { Screen } from '@/components/Screen';
import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, dimensions, opacity, radius, spacing } from '@/theme/tokens';

type Role = 'aluno' | 'professor';

const profiles = [
  { role: 'aluno', title: 'Aluno', symbol: 'A', description: 'Descobre projetos e encontra a equipa certa para ti.' },
  { role: 'professor', title: 'Professor', symbol: 'P', description: 'Acompanha projetos e grupos da tua unidade curricular.' },
] as const;

export default function ChooseProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [selected, setSelected] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigating = useRef(false);

  useFocusEffect(useCallback(() => {
    navigating.current = false;
    setSubmitting(false);
  }, []));

  function continueToDemo() {
    if (!selected || navigating.current) return;
    navigating.current = true;
    setSubmitting(true);
    router.push({ pathname: '/demo', params: { role: selected } });
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <EntryHeader back backTo="/login" label="ACESSO DEMONSTRATIVO" />
        <View style={styles.main}>
          <View style={styles.intro}>
            <AppText variant="title" accessibilityRole="header">Como vais usar o StudyMatch?</AppText>
            <AppText tone="secondary">Escolhe a experiência que queres explorar.</AppText>
          </View>
          <View style={styles.options} accessibilityRole="radiogroup">
            {profiles.map((profile) => {
              const active = selected === profile.role;
              return (
                <Pressable
                  key={profile.role}
                  accessibilityRole="radio"
                  accessibilityLabel={profile.title}
                  accessibilityHint={profile.description}
                  accessibilityState={{ selected: active }}
                  onPress={() => setSelected(profile.role)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <AppCard style={[styles.card, active && { borderColor: colors.primary, borderWidth: borderWidth.strong }]}>
                    <View style={[styles.symbol, { backgroundColor: colors.surfaceRaised }]}>
                      <AppText variant="heading" tone="accent">{profile.symbol}</AppText>
                    </View>
                    <View style={styles.cardText}>
                      <AppText variant="heading">{profile.title}</AppText>
                      <AppText variant="caption" tone="secondary">{profile.description}</AppText>
                    </View>
                    <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}>
                      {active && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                    </View>
                  </AppCard>
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={styles.footer}>
          <AppButton title="Continuar" disabled={!selected || submitting} onPress={continueToDemo} />
          <AppText variant="caption" tone="secondary" style={styles.note}>
            Podes experimentar os dois perfis. Ainda não existe autenticação real.
          </AppText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'space-between', paddingTop: spacing.sm, paddingBottom: spacing.xl },
  main: { gap: spacing.xxl, paddingVertical: spacing.xl },
  intro: { gap: spacing.xs },
  options: { gap: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  symbol: { width: dimensions.controlMd, height: dimensions.controlMd, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  cardText: { flex: 1, gap: spacing.xxs },
  radio: { width: spacing.lg, height: spacing.lg, borderRadius: radius.pill, borderWidth: borderWidth.strong, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: spacing.xs, height: spacing.xs, borderRadius: radius.pill },
  footer: { gap: spacing.md },
  note: { textAlign: 'center' },
  pressed: { opacity: opacity.pressed },
});
