import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { EntryHeader } from '@/components/EntryHeader';
import { RoleSelector, type DemoRole } from '@/components/RoleSelector';
import { Screen } from '@/components/Screen';
import { emailError as getEmailError } from '@/features/entry/validation';
import { spacing } from '@/theme/tokens';

export default function RegisterScreen() {
  const router = useRouter();
  const navigating = useRef(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [role, setRole] = useState<DemoRole | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useFocusEffect(useCallback(() => {
    navigating.current = false;
    setSubmitting(false);
  }, []));

  const nameError = name.trim() ? undefined : 'Introduz o teu nome.';
  const emailError = getEmailError(email);
  const passwordError = password.length >= 8 ? undefined : 'Usa pelo menos 8 caracteres.';
  const confirmationError = confirmation === password && confirmation
    ? undefined : 'As palavras-passe não coincidem.';
  const roleError = role ? undefined : 'Escolhe o teu perfil.';

  function submit() {
    if (navigating.current) return;
    setAttempted(true);
    if (nameError || emailError || passwordError || confirmationError || roleError) return;
    navigating.current = true;
    setSubmitting(true);
    setPassword('');
    setConfirmation('');
    router.push({ pathname: '/demo', params: { role, source: 'register' } });
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
          <EntryHeader back backTo="/login" label="STUDYMATCH" />
          <View style={styles.intro}>
            <AppText variant="title" accessibilityRole="header">Criar conta</AppText>
            <AppText tone="secondary">Preenche os dados para experimentares o registo.</AppText>
          </View>
          <View style={styles.form}>
            <AppInput
              label="Nome"
              placeholder="O teu nome"
              value={name}
              onChangeText={setName}
              error={attempted ? nameError : undefined}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
            />
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
            />
            <AppInput
              label="Palavra-passe"
              placeholder="Pelo menos 8 caracteres"
              value={password}
              onChangeText={setPassword}
              error={attempted ? passwordError : undefined}
              secureTextEntry
              autoComplete="off"
              textContentType="newPassword"
            />
            <AppInput
              label="Confirmar palavra-passe"
              placeholder="Repete a palavra-passe"
              value={confirmation}
              onChangeText={setConfirmation}
              error={attempted ? confirmationError : undefined}
              secureTextEntry
              autoComplete="off"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={submit}
            />
            <RoleSelector value={role} onChange={setRole} error={attempted ? roleError : undefined} />
            <AppButton title="Criar conta" disabled={submitting} onPress={submit} />
          </View>
          <AppText variant="caption" tone="secondary" style={styles.note}>
            Demonstração académica. O formulário não cria uma conta nem guarda os teus dados.
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  page: { flexGrow: 1, justifyContent: 'space-between', gap: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xl },
  intro: { gap: spacing.xs },
  form: { gap: spacing.lg },
  note: { textAlign: 'center' },
});
