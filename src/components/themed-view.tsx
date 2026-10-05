import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing, Surfaces, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  type?: ThemeColor;
  surface?: keyof typeof Surfaces;
};

export function ThemedView({ style, lightColor, type, surface, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  const backgroundColor = lightColor ?? (surface ? Surfaces[surface] : theme[type ?? 'background']);

  return (
    <View
      style={[{ backgroundColor }, surface === 'card' && styles.card, style]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
