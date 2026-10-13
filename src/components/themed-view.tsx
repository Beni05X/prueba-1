import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Sizes, Spacing, type ThemeColor } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  type?: ThemeColor;
  surface?: 'screen' | 'card' | 'control';
};

export function ThemedView({ style, lightColor, type, surface, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  const backgroundColor = lightColor ?? (surface === 'card' || surface === 'control' ? theme.backgroundElement : theme[type ?? 'background']);

  return (
    <View
      style={[{ backgroundColor }, surface === 'card' && styles.card, surface === 'card' && { borderColor: theme.border }, style]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: Sizes.borderWidth,
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
