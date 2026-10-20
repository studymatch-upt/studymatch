import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
} from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { BrandMark } from '@/components/BrandMark';
import { EntryHeader } from '@/components/EntryHeader';
import { RoleSelector, type DemoRole } from '@/components/RoleSelector';
import { Screen } from '@/components/Screen';
import { emailError as getEmailError } from '@/features/entry/validation';
import { useDemoSession } from '@/features/student/DemoSession';
import { useTheme } from '@/theme/ThemeProvider';
import { dimensions, opacity, spacing } from '@/theme/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const { startStudentSession } = useDemoSession();
  const { colors } = useTheme();
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const navigating = useRef(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<DemoRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(useCallback(() => {
    navigating.current = false;
    setSubmitting(false);
  }, []));

  const emailError = getEmailError(email);
  const passwordError = password ? undefined : 'Introduz a tua palavra-passe.';
  const roleError = role ? undefined : 'Escolhe o teu perfil.';

  async function submit() {
    if (navigating.current) return;
    setAttempted(true);
    if (emailError || passwordError || roleError) return;
    navigating.current = true;
    setSubmitting(true);
    setPassword('');
    if (role === 'aluno') {
      await startStudentSession(email);
    } else {
      router.push({ pathname: '/demo', params: { role } });
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.page}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          showsVerticalScrollIndicator={false}
        >
          <EntryHeader back />
          <View style={styles.main}>
            <View style={styles.brand}>
              <BrandMark size={dimensions.symbol} />
              <AppText variant="label">StudyMatch</AppText>
            </View>
            <View style={styles.intro}>
              <AppText variant="title" accessibilityRole="header">Bem-vindo de volta</AppText>
              <AppText tone="secondary">Entra para encontrares a tua próxima equipa.</AppText>
            </View>
            <View style={styles.form}>
              <AppInput
                label="Email"
                placeholder="nome@exemplo.pt"
                value={email}
                onChangeText={setEmail}
                error={attempted ? emailError : undefined}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
              />
              <AppInput
                ref={passwordRef}
                label="Palavra-passe"
                placeholder="Introduz a tua palavra-passe"
                value={password}
                onChangeText={setPassword}
                error={attempted ? passwordError : undefined}
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="off"
                returnKeyType="done"
                onSubmitEditing={submit}
                rightAccessory={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                    accessibilityState={{ selected: showPassword }}
                    onPress={() => setShowPassword((current) => !current)}
                    style={({ pressed }) => [styles.showPassword, pressed && styles.pressed]}
                  >
                    <AppText variant="caption" tone="accent">{showPassword ? 'Ocultar' : 'Mostrar'}</AppText>
                  </Pressable>
                }
              />
              <RoleSelector value={role} onChange={setRole} error={attempted ? roleError : undefined} />
              <AppButton title="Entrar" disabled={submitting} onPress={submit} />
              <Pressable
                accessibilityRole="link"
                accessibilityLabel="Criar conta"
                onPress={() => router.push('/register')}
                style={({ pressed }) => [styles.register, pressed && styles.pressed]}
              >
                <AppText variant="caption" tone="secondary">Ainda não tens conta? </AppText>
                <AppText variant="label" tone="accent">Criar conta</AppText>
              </Pressable>
            </View>
          </View>
          <View style={styles.note}>
            <View style={[styles.noteDot, { backgroundColor: colors.primary }]} />
            <AppText variant="caption" tone="secondary" style={styles.noteText}>
              Demonstração académica. Este acesso não autentica uma conta real.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flexGrow: 1, justifyContent: 'space-between', paddingTop: spacing.sm, paddingBottom: spacing.xl },
  main: { gap: spacing.xxl, paddingVertical: spacing.xl },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  intro: { gap: spacing.xs },
  form: { gap: spacing.lg },
  register: { minHeight: dimensions.controlSm, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  showPassword: { minHeight: dimensions.controlSm, justifyContent: 'center', paddingHorizontal: spacing.xs },
  pressed: { opacity: opacity.pressed },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  noteDot: { width: spacing.xs, height: spacing.xs, borderRadius: spacing.xs, marginTop: spacing.xs },
  noteText: { flex: 1 },
});
