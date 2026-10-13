import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/theme';

/** Content footer for legal/help copy; distinct from the app's bottom navigation. */
export function AppFooter({ children }: { children: ReactNode }) { return <View style={styles.footer}>{children}</View>; }
const styles = StyleSheet.create({ footer: { marginTop: Spacing.four, paddingHorizontal: Spacing.three, gap: Spacing.three, alignItems: 'center' } });
