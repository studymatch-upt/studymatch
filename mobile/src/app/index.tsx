import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { BrandMark } from '@/components/BrandMark';
import { EntryHeader } from '@/components/EntryHeader';
import { Screen } from '@/components/Screen';
import { DemoAccountPanel } from '@/features/student/DemoAccountPanel';
import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, radius, spacing } from '@/theme/tokens';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const artSize = Math.min(width - spacing.xl * 2, 320);

  if (__DEV__) return <Screen>
    <ScrollView contentContainerStyle={styles.demoPage} showsVerticalScrollIndicator={false}>
      <EntryHeader label="STUDYMATCH" />
      <View style={styles.demoContent}>
        <BrandMark size={56} />
        <View style={styles.demoCopy}>
          <AppText variant="title" accessibilityRole="header">Explorar StudyMatch</AppText>
          <AppText tone="secondary">Escolhe um aluno de teste para ver os dados académicos reais do backend.</AppText>
        </View>
        <DemoAccountPanel />
        <AppButton title="Ir para o Login" variant="outline" onPress={() => router.push('/login')} />
        <AppText variant="caption" tone="secondary">O painel é demonstrativo e não autentica uma conta.</AppText>
      </View>
    </ScrollView>
  </Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <EntryHeader label="STUDYMATCH" />
        <View style={styles.hero}>
          <View style={[styles.art, { width: artSize, height: artSize }]}>
            <View style={[styles.outerRing, { width: artSize, height: artSize, borderColor: colors.border }]} />
            <View style={[styles.middleRing, { width: artSize * 0.72, height: artSize * 0.72, borderColor: colors.border }]} />
            <View style={[styles.innerCircle, { width: artSize * 0.42, height: artSize * 0.42, backgroundColor: colors.surface, borderColor: colors.border }]} />
            <View style={[styles.node, styles.nodeTop, { backgroundColor: colors.primary }]} />
            <View style={[styles.node, styles.nodeLeft, { backgroundColor: colors.primaryBright }]} />
            <View style={[styles.node, styles.nodeRight, { backgroundColor: colors.primaryBright }]} />
            <BrandMark size={artSize * 0.25} />
          </View>
          <View style={styles.copy}>
            <AppText variant="title" accessibilityRole="header" style={styles.name}>StudyMatch</AppText>
            <AppText variant="body" tone="secondary" style={styles.tagline}>Encontra a tua equipa ideal.</AppText>
          </View>
        </View>
        <View style={styles.footer}>
          <AppButton title="Começar" onPress={() => router.push('/login')} />
          <AppText variant="caption" tone="secondary" style={styles.footnote}>Projetos melhores começam em conjunto.</AppText>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  demoPage: { flexGrow: 1, gap: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  demoContent: { flex: 1, justifyContent: 'center', gap: spacing.md },
  demoCopy: { gap: spacing.xs },
  page: { flexGrow: 1, justifyContent: 'space-between', paddingTop: spacing.sm, paddingBottom: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.lg, paddingVertical: spacing.xl },
  art: { alignItems: 'center', justifyContent: 'center' },
  outerRing: { position: 'absolute', borderWidth: borderWidth.thin, borderRadius: radius.pill },
  middleRing: { position: 'absolute', borderWidth: borderWidth.thin, borderRadius: radius.pill },
  innerCircle: { position: 'absolute', borderWidth: borderWidth.thin, borderRadius: radius.pill },
  node: { position: 'absolute', width: spacing.sm, height: spacing.sm, borderRadius: radius.pill },
  nodeTop: { top: spacing.lg },
  nodeLeft: { left: spacing.lg, bottom: spacing.xxl * 2 },
  nodeRight: { right: spacing.lg, bottom: spacing.xxl * 2 },
  copy: { alignItems: 'center', gap: spacing.xs },
  name: { textAlign: 'center' },
  tagline: { textAlign: 'center' },
  footer: { gap: spacing.md },
  footnote: { textAlign: 'center' },
});
