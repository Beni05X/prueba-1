import { forwardRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps, type View } from 'react-native';
import type React from 'react';

import { ThemedText } from '@/components/themed-text';
import { ControlStates, Radius, Sizes, Spacing, Typography } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonProps = PressableProps & {
  label: string;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  icon?: React.ReactNode;
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  { label, variant = 'primary', disabled, loading = false, icon, style, accessibilityState, ...props },
  ref,
) {
  const theme = useTheme();
  const primary = variant === 'primary';
  const unavailable = !!disabled || loading;

  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityLabel={label}
      {...props}
      disabled={unavailable}
      accessibilityState={{ ...accessibilityState, disabled: unavailable, busy: loading }}
      style={(state) => [
        styles.button,
        {
          backgroundColor: primary
            ? theme.primary
            : state.pressed && !unavailable
              ? theme.backgroundSelected
              : theme.backgroundElement,
          borderColor: primary ? theme.primary : theme.border,
          opacity: unavailable
            ? ControlStates.opacity.disabled
            : state.pressed
              ? ControlStates.opacity.pressed
              : ControlStates.opacity.default,
        },
        typeof style === 'function' ? style(state) : style,
      ]}>
      {icon}{loading ? <ActivityIndicator color={primary ? theme.onPrimary : theme.primary} /> : <ThemedText themeColor={primary ? 'onPrimary' : 'primary'} style={styles.label}>{label}</ThemedText>}
    </Pressable>
  );
});

export { Button as CustomButton };

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
