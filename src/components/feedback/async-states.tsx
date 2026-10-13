import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Spacing } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import { StatusMessage } from './status-message';

export function LoadingState({ label = 'Cargando…' }: { label?: string }) { const theme = useTheme(); return <View style={styles.loading}><ActivityIndicator color={theme.primary} /><ThemedText accessibilityRole="alert" themeColor="textSecondary">{label}</ThemedText></View>; }
export function EmptyState({ title, description }: { title: string; description?: string }) { return <View style={styles.box}><ThemedText type="label">{title}</ThemedText>{description ? <ThemedText type="small" themeColor="textSecondary">{description}</ThemedText> : null}</View>; }
export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) { return <View style={styles.box}><StatusMessage message={message} /><Button label="Reintentar" variant="secondary" onPress={onRetry} /></View>; }
const styles = StyleSheet.create({ loading: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, box: { gap: Spacing.two, alignItems: 'flex-start' } });
