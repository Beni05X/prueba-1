import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Touchable } from '@/components/ui/touchable';
import { ControlStates, Radius, Sizes, Spacing, Typography } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = TextInputProps & { label: string; error?: string; onTogglePassword?: () => void };

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, style, accessibilityLabel = label, editable = true, accessibilityState, onFocus, onBlur, onTogglePassword, secureTextEntry, ...props }, ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={[styles.control, {
        backgroundColor: theme.backgroundElement,
        borderColor: error || (focused && editable) ? theme.primary : theme.border,
        opacity: editable ? ControlStates.opacity.default : ControlStates.opacity.disabled,
      }]}>
        <TextInput
          ref={ref}
          accessibilityLabel={error ? `${accessibilityLabel}. Error: ${error}` : accessibilityLabel}
          placeholderTextColor={theme.textSecondary}
          selectionColor={theme.primary}
          {...props}
          secureTextEntry={secureTextEntry}
          editable={editable}
          accessibilityState={{ ...accessibilityState, disabled: !editable }}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          style={[styles.input, { color: theme.text }, style]}
        />
        {onTogglePassword ? (
          <Touchable disabled={!editable} onPress={onTogglePassword} accessibilityRole="button" accessibilityLabel={`${secureTextEntry ? 'Mostrar' : 'Ocultar'} ${label.toLowerCase()}`} style={styles.toggle}>
            <ThemedText type="label" themeColor="primary">{secureTextEntry ? 'Mostrar' : 'Ocultar'}</ThemedText>
          </Touchable>
        ) : null}
      </View>
      {error ? <ThemedText type="small" accessibilityRole="alert" accessibilityLiveRegion="polite">{error}</ThemedText> : null}
    </View>
  );
});
export { TextField as CustomInput };
const styles = StyleSheet.create({
  field: { gap: Spacing.two },
  control: { flexDirection: 'row', alignItems: 'center', borderWidth: Sizes.borderWidth, borderRadius: Radius.control },
  input: { ...Typography.body, flex: 1, minWidth: 0, minHeight: Sizes.controlMinHeight, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  toggle: { paddingHorizontal: Spacing.two, justifyContent: 'center', alignItems: 'center' },
});
