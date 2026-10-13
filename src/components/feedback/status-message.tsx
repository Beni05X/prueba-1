import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Sizes, Spacing } from '@/theme';

export function StatusMessage({ message, tone = 'error' }: { message: string; tone?: 'error' | 'success' | 'info' }) {
  const theme = useTheme();
  return <View style={[styles.box, { backgroundColor: tone === 'error' ? theme.primarySoft : theme.backgroundElement, borderColor: tone === 'success' ? theme.success : theme.primary }]}>
    <ThemedText type="small" accessibilityRole="alert" accessibilityLiveRegion="polite">{message}</ThemedText>
  </View>;
}
const styles = StyleSheet.create({ box: { padding: Spacing.three, borderRadius: Radius.control, borderLeftWidth: Sizes.borderWidth * 3 } });
