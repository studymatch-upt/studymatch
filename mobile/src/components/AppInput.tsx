import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, dimensions, fontSize, radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
};

export function AppInput({
  label,
  error,
  hint,
  style,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: Props) {
  const { colors, resolvedTheme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <AppText variant="label" style={styles.label}>{label}</AppText>
      <TextInput
        {...props}
        editable={editable}
        accessibilityLabel={props.accessibilityLabel ?? label}
        accessibilityHint={error ?? hint}
        accessibilityState={{ disabled: !editable }}
        placeholderTextColor={colors.textSecondary}
        selectionColor={colors.primaryBright}
        keyboardAppearance={resolvedTheme}
        underlineColorAndroid="transparent"
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
        style={[
          styles.input,
          {
            color: editable ? colors.text : colors.disabled,
            backgroundColor: colors.surface,
            borderColor: error ? colors.error.text : focused ? colors.primaryBright : colors.border,
          },
          style,
        ]}
      />
      {(error || hint) && (
        <AppText variant="caption" style={{ color: error ? colors.error.text : colors.textSecondary }}>
          {error ?? hint}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { marginBottom: spacing.xxs },
  input: {
    minHeight: dimensions.controlMd,
    borderWidth: borderWidth.thin,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.body,
  },
});
