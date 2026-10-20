import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppCard } from '@/components/AppCard';
import { AppText } from '@/components/AppText';
import { SegmentedControl } from '@/components/SegmentedControl';
import { useDemoSession } from '@/features/student/DemoSession';
import { demoStudent } from '@/features/student/data';
import { StudentIcon } from '@/features/student/StudentIcon';
import { StudentPage, studentStyles } from '@/features/student/StudentPage';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';
import { dimensions, radius, spacing } from '@/theme/tokens';

const themes = [{ label: 'Sistema', value: 'system' }, { label: 'Claro', value: 'light' }, { label: 'Escuro', value: 'dark' }] as const;

export default function Profile() {
  const { colors, preference, setPreference } = useTheme();
  const { setStudentActive } = useDemoSession();
  return (
    <StudentPage title="Perfil" subtitle="Uma identidade de exemplo para explorares o StudyMatch.">
      <View style={studentStyles.row}>
        <View style={[styles.avatar, { backgroundColor: colors.surfaceRaised }]}><StudentIcon name="profile" color={colors.accentText} /></View>
        <View style={[studentStyles.copy, studentStyles.flex]}>
          <AppText variant="heading">{demoStudent.name}</AppText>
          <AppText variant="caption" tone="secondary">{demoStudent.course}</AppText>
          <AppText variant="caption" tone="secondary">{demoStudent.year}</AppText>
        </View>
      </View>
      <AppCard style={studentStyles.stack}>
        <AppText variant="label" accessibilityRole="header">Informação pessoal</AppText>
        <View style={studentStyles.copy}>
          <AppText variant="caption" tone="secondary">Número de aluno · Exemplo</AppText>
          <AppText variant="label">{demoStudent.number}</AppText>
        </View>
        <AppText variant="caption" tone="secondary">Estes dados são fictícios. A edição do perfil estará disponível numa próxima fase.</AppText>
      </AppCard>
      <AppCard style={studentStyles.stack}>
        <AppText variant="label" accessibilityRole="header">Aparência</AppText>
        <SegmentedControl<ThemePreference> label="Tema da aplicação" options={themes} value={preference} onChange={setPreference} />
        <AppText variant="caption" tone="secondary">A preferência de tema é guardada neste dispositivo.</AppText>
      </AppCard>
      <AppButton title="Terminar sessão demonstrativa" variant="outline" onPress={() => setStudentActive(false)} />
    </StudentPage>
  );
}

const styles = StyleSheet.create({ avatar: { width: dimensions.controlMd, height: dimensions.controlMd, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', marginVertical: spacing.xs } });
