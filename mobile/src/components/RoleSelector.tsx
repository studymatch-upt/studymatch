import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

import { AppText } from './AppText';
import { SegmentedControl } from './SegmentedControl';

export type DemoRole = 'aluno' | 'professor' | 'administrador';

export const roleNames: Record<DemoRole, string> = {
  aluno: 'Aluno',
  professor: 'Professor',
  administrador: 'Administrador',
};

const options = [
  { label: 'Aluno', value: 'aluno' },
  { label: 'Professor', value: 'professor' },
  { label: 'Admin', value: 'administrador' },
] as const;

type Props = {
  value: DemoRole | null;
  onChange: (role: DemoRole) => void;
  error?: string;
};

export function RoleSelector({ value, onChange, error }: Props) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <AppText variant="label">Perfil</AppText>
      <SegmentedControl<DemoRole>
        label="Escolhe o teu perfil"
        options={options}
        value={value}
        onChange={onChange}
      />
      {error && (
        <AppText variant="caption" accessibilityLiveRegion="polite" style={{ color: colors.error.text }}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { gap: spacing.xs } });
