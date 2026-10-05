import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ControlStates, Radius, Sizes, Spacing, Surfaces, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = TextInputProps & {
  label: string;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  {
    label,
    style,
    accessibilityLabel = label,
    editable = true,
    accessibilityState,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        ref={ref}
        accessibilityLabel={accessibilityLabel}
        placeholderTextColor={theme.textSecondary}
        selectionColor={theme.primary}
        {...props}
        editable={editable}
        accessibilityState={{ ...accessibilityState, disabled: !editable }}
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
            color: theme.text,
            backgroundColor: Surfaces.control,
            borderColor: focused && editable ? ControlStates.focusBorder : theme.border,
            opacity: editable ? ControlStates.opacity.default : ControlStates.opacity.disabled,
          },
          style,
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  input: {
    ...Typography.body,
    minHeight: Sizes.controlMinHeight,
    borderWidth: Sizes.borderWidth,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
