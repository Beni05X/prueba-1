import { useHeaderHeight } from 'expo-router/react-navigation';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Sizes, Spacing, Surfaces } from '@/constants/theme';

export type ScreenProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export function Screen({ title, subtitle, children }: ScreenProps) {
  const headerHeight = useHeaderHeight();

  return (
    <SafeAreaView
      edges={['left', 'right', 'bottom']}
      style={[styles.screen, { backgroundColor: Surfaces.screen }]}>
      <KeyboardAvoidingView
        style={styles.screen}
        keyboardVerticalOffset={headerHeight}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">
          <View style={styles.content}>
            <View style={styles.heading}>
              <ThemedText type="title" accessibilityRole="header">
                {title}
              </ThemedText>
              {subtitle ? (
                <ThemedText themeColor="textSecondary">{subtitle}</ThemedText>
              ) : null}
            </View>
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
    padding: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: Sizes.maxContentWidth,
    alignSelf: 'center',
    gap: Spacing.four,
  },
  heading: {
    gap: Spacing.two,
  },
});
