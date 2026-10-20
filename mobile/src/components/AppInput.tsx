import { forwardRef, useState } from 'react';
import type { ComponentRef, ReactNode } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { borderWidth, dimensions, fontSize, radius, spacing } from '@/theme/tokens';

import { AppText } from './AppText';

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  rightAccessory?: ReactNode;
};

export const AppInput = forwardRef<ComponentRef<typeof TextInput>, Props>(function AppInput({
  label,
  error,
  hint,
  rightAccessory,
  style,
  editable = true,
  onFocus,
  onBlur,
  ...props
}: Props, ref) {
  const { colors, resolvedTheme } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <AppText variant="label" style={styles.label}>{label}</AppText>
      <View style={[styles.field, {
        backgroundColor: colors.surface,
        borderColor: error ? colors.error.text : focused ? colors.primaryBright : colors.border,
      }]}>
        <TextInput
          ref={ref}
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
          style={[styles.input, { color: editable ? colors.text : colors.disabled }, style]}
        />
        {rightAccessory && <View style={styles.accessory}>{rightAccessory}</View>}
      </View>
      {(error || hint) && (
        <AppText
          variant="caption"
          accessibilityLiveRegion={error ? 'polite' : undefined}
          style={{ color: error ? colors.error.text : colors.textSecondary }}
        >
          {error ?? hint}
        </AppText>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { marginBottom: spacing.xxs },
  field: {
    minHeight: dimensions.controlMd,
    borderWidth: borderWidth.thin,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: dimensions.controlMd - borderWidth.strong,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.body,
  },
  accessory: { paddingRight: spacing.xs },
});
