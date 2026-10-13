import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { Sizes, Spacing } from '@/theme';

export type AppHeaderProps = Readonly<{ title?: string; subtitle?: string; backHref?: Href; brand?: boolean; compact?: boolean; actions?: ReactNode }>;

export function AppHeader({ title, subtitle, backHref, brand, compact, actions }: AppHeaderProps) {
  if (!brand && !title && !subtitle && !actions) return null;
  return <View style={styles.container}>
    {brand ? <ThemedText type="subtitle" themeColor="primary" style={styles.brand}>SALÓN BRENN’S</ThemedText> : null}
    {title ? <View style={styles.titleRow}>
      {backHref ? <Link href={backHref} dismissTo asChild><Touchable accessibilityRole="button" accessibilityLabel="Regresar" style={styles.back}><Icon name="chevron-left" /></Touchable></Link> : null}
      {title ? <ThemedText type={compact ? 'subtitle' : 'title'} accessibilityRole="header" style={styles.title}>{title}</ThemedText> : null}
      {actions}
    </View> : null}
    {subtitle ? <ThemedText themeColor="textSecondary">{subtitle}</ThemedText> : null}
  </View>;
}

const styles = StyleSheet.create({ container: { gap: Spacing.one }, brand: { marginBottom: Spacing.five }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, title: { flex: 1 }, back: { minWidth: Sizes.touchMinWidth, minHeight: Sizes.controlMinHeight, alignItems: 'center', justifyContent: 'center', borderRadius: Sizes.controlMinHeight / 2 } });
