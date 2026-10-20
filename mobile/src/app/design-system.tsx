import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppBadge } from '@/components/AppBadge';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';
import { dimensions, radius, spacing } from '@/theme/tokens';

const themeOptions = [
  { label: 'Sistema', value: 'system' },
  { label: 'Claro', value: 'light' },
  { label: 'Escuro', value: 'dark' },
] as const;

export default function HomeScreen() {
  const { colors, preference, setPreference, resolvedTheme } = useTheme();
  const [projectName, setProjectName] = useState('');
  const [feedback, setFeedback] = useState('');

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.mark, { backgroundColor: colors.primary }]}>
            <AppText variant="heading" tone="inverse">S</AppText>
          </View>
          <AppBadge label="SISTEMA VISUAL" status="info" />
        </View>

        <View style={styles.intro}>
          <AppText variant="title" accessibilityRole="header">StudyMatch</AppText>
          <AppText tone="secondary">Uma base visual simples para os próximos ecrãs.</AppText>
        </View>

        <View style={styles.section}>
          <AppText variant="label">Aparência</AppText>
          <SegmentedControl<ThemePreference>
            label="Tema da aplicação"
            options={themeOptions}
            value={preference}
            onChange={setPreference}
          />
          <AppText variant="caption" tone="secondary">
            Tema ativo: {resolvedTheme === 'dark' ? 'escuro' : 'claro'}
          </AppText>
        </View>

        <AppCard style={styles.featureCard}>
          <AppBadge label="BASE MÓVEL" status="success" />
          <AppText variant="heading">Feito para estudar em conjunto.</AppText>
          <AppText tone="secondary">
            A mesma linguagem visual acompanha alunos e professores em toda a aplicação.
          </AppText>
        </AppCard>

        <View style={styles.section}>
          <AppText variant="heading">Componentes</AppText>
          <AppText variant="caption" tone="secondary">Ações, campos e estados de exemplo.</AppText>
        </View>

        <AppCard style={styles.stack}>
          <AppText variant="label">Ações</AppText>
          <AppButton title="Continuar" onPress={() => setFeedback('Selecionaste Continuar.')} />
          <View style={styles.buttonRow}>
            <AppButton title="Mais tarde" variant="secondary" style={styles.flex} onPress={() => setFeedback('Selecionaste Mais tarde.')} />
            <AppButton title="Detalhes" variant="outline" style={styles.flex} onPress={() => setFeedback('Selecionaste Detalhes.')} />
          </View>
          <AppButton title="Indisponível" disabled />
          {!!feedback && <AppText variant="caption" tone="secondary" accessibilityLiveRegion="polite">{feedback}</AppText>}
        </AppCard>

        <AppCard style={styles.stack}>
          <AppInput
            label="Nome do projeto"
            placeholder="Escreve um nome"
            hint="Campo de exemplo"
            value={projectName}
            onChangeText={setProjectName}
          />
          <ProgressBar label="Exemplo de progresso" value={42} />
          <View style={styles.badges}>
            <AppBadge label="Concluído" status="success" />
            <AppBadge label="Pendente" status="warning" />
            <AppBadge label="Informação" status="info" />
            <AppBadge label="Erro" status="error" />
          </View>
        </AppCard>

        <AppCard>
          <EmptyState title="Ainda sem conteúdo" description="Este é o aspeto de um estado vazio." />
        </AppCard>

        <AppCard>
          <LoadingState message="A preparar conteúdo..." />
        </AppCard>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  mark: { width: dimensions.symbol, height: dimensions.symbol, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  intro: { gap: spacing.xxs },
  section: { gap: spacing.sm },
  featureCard: { gap: spacing.md, paddingVertical: spacing.xl },
  stack: { gap: spacing.md },
  buttonRow: { flexDirection: 'row', gap: spacing.xs },
  flex: { flex: 1 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
});
