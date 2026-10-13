import { usePathname, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/layout/app-header';
import { showsBottomNavigation } from '@/constants/navigation';
import { Sizes, Spacing } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export type ScreenProps = {
  title?: string;
  subtitle?: string;
  backHref?: Href;
  brand?: boolean;
  compactHeader?: boolean;
  headerActions?: ReactNode;
  children?: ReactNode;
};

export function Screen({ title, subtitle, backHref, brand, compactHeader, headerActions, children }: ScreenProps) {
  const hasBottomNavigation = showsBottomNavigation(usePathname());
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={hasBottomNavigation ? ['top', 'left', 'right'] : ['top', 'left', 'right', 'bottom']}
      style={[styles.screen, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View style={styles.content}>
            <AppHeader title={title} subtitle={subtitle} backHref={backHref} brand={brand} compact={compactHeader} actions={headerActions} />
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.three,
    paddingBottom: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: Sizes.maxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
});
