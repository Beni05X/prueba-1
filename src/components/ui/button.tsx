import { forwardRef } from 'react';
import { Pressable, StyleSheet, type PressableProps, type View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ControlStates, Radius, Sizes, Spacing, Surfaces, Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  { label, variant = 'primary', disabled, style, accessibilityState, ...props },
  ref,
) {
  const theme = useTheme();
  const primary = variant === 'primary';

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...props}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      style={(state) => [
        styles.button,
        {
          backgroundColor: primary
            ? theme.primary
            : state.pressed && !disabled
              ? ControlStates.secondaryPressedBackground
              : Surfaces.control,
          borderColor: primary ? theme.primary : theme.border,
          opacity: disabled
            ? ControlStates.opacity.disabled
            : state.pressed
              ? ControlStates.opacity.pressed
              : ControlStates.opacity.default,
        },
        typeof style === 'function' ? style(state) : style,
      ]}>
      <ThemedText themeColor={primary ? 'onPrimary' : 'primary'} style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    minHeight: Sizes.controlMinHeight,
    minWidth: Sizes.touchMinWidth,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Sizes.borderWidth,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  label: {
    ...Typography.action,
    textAlign: 'center',
  },
});
