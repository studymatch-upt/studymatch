import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/AppButton';
import { AppInput } from '@/components/AppInput';
import { AppText } from '@/components/AppText';
import { EntryHeader } from '@/components/EntryHeader';
import { RoleSelector, type DemoRole } from '@/components/RoleSelector';
import { Screen } from '@/components/Screen';
import { emailError as getEmailError } from '@/features/entry/validation';
import { useDemoSession } from '@/features/student/DemoSession';
import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, radius, spacing } from '@/theme/tokens';

export default function RegisterScreen() {
  const router = useRouter();
  const { startStudentSession } = useDemoSession();
  const { colors } = useTheme();
  const navigating = useRef(false);
  const [name, setName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [curricularYear, setCurricularYear] = useState<1 | 2 | 3 | null>(null);
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
  const studentNumberError = role !== 'aluno'
    ? undefined
    : !studentNumber.trim()
      ? 'Introduz o teu número de aluno.'
      : !/^\d+$/.test(studentNumber.trim())
        ? 'O número de aluno deve conter apenas algarismos.'
        : undefined;
  const emailError = getEmailError(email);
  const yearError = role === 'aluno' && !curricularYear ? 'Escolhe o teu ano curricular.' : undefined;
  const passwordError = password.length >= 8 ? undefined : 'Usa pelo menos 8 caracteres.';
  const confirmationError = confirmation === password && confirmation
    ? undefined : 'As palavras-passe não coincidem.';
  const roleError = role ? undefined : 'Escolhe o teu perfil.';

  async function submit() {
    if (navigating.current) return;
    setAttempted(true);
    if (nameError || studentNumberError || yearError || emailError || passwordError || confirmationError || roleError) return;
    navigating.current = true;
    setSubmitting(true);
    setPassword('');
    setConfirmation('');
    if (role === 'aluno') {
      await startStudentSession(email, { name: name.trim(), curricularYear: curricularYear! });
    } else {
      router.push({ pathname: '/demo', params: { role, source: 'register' } });
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
            <RoleSelector value={role} onChange={setRole} error={attempted ? roleError : undefined} />
            {role === 'aluno' && <>
              <AppInput
                label="Número de aluno"
                placeholder="Introduz o teu número de aluno"
                value={studentNumber}
                onChangeText={setStudentNumber}
                error={attempted ? studentNumberError : undefined}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
              <View style={styles.years}>
                <AppText variant="label">Ano curricular</AppText>
                <View style={styles.yearRow}>{([1, 2, 3] as const).map((year) => (
                  <Pressable key={year} accessibilityRole="radio" accessibilityLabel={`${year}º ano`} accessibilityState={{ checked: curricularYear === year }} onPress={() => setCurricularYear(year)} style={[styles.year, { borderColor: curricularYear === year ? colors.primary : colors.border, backgroundColor: curricularYear === year ? colors.surfaceRaised : colors.surface }]}>
                    <AppText variant="label">{year}º ano</AppText>
                  </Pressable>
                ))}</View>
                {attempted && yearError && <AppText variant="caption" tone="secondary">{yearError}</AppText>}
              </View>
            </>}
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
            <AppButton title="Criar conta" disabled={submitting} onPress={submit} />
          </View>
          <AppText variant="caption" tone="secondary" style={styles.note}>
            Demonstração académica. Não é criada uma conta real. O questionário é guardado apenas neste dispositivo, associado ao email introduzido.
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
  years: { gap: spacing.sm },
  yearRow: { flexDirection: 'row', gap: spacing.sm },
  year: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, borderWidth: borderWidth.thin, borderRadius: radius.md },
  note: { textAlign: 'center' },
});
