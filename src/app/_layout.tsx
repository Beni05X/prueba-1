import { FontDisplay, useFonts } from 'expo-font';
import { DefaultTheme, router, Stack, ThemeProvider, usePathname, useGlobalSearchParams } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomNavigation } from '@/components/navigation/bottom-navigation';
import { NavigationSections } from '@/constants/navigation';
import { Fonts, NavigationFonts, Typography } from '@/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemePreferenceProvider, useThemePreferences } from '@/theme/theme-preference-provider';
import { AuthSessionProvider, useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { isProtectedPath as requiresSession } from '@/modules/auth/models/auth-navigation';


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return <ThemePreferenceProvider><AuthSessionProvider><AppShell /></AuthSessionProvider></ThemePreferenceProvider>;
}

function AppShell() {
  const [fontsLoaded, fontError] = useFonts({
    [Fonts.regular]: {
      uri: require('../../assets/fonts/Inter-Regular.ttf'),
      display: FontDisplay.SWAP,
    },
    [Fonts.bold]: {
      uri: require('../../assets/fonts/Inter-Bold.ttf'),
      display: FontDisplay.SWAP,
    },
  });
  const colors = useTheme();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const { isDark } = useThemePreferences();
  const auth = useAuthSession();
  const isProtectedPath = requiresSession(pathname);
  const returnQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === 'seccion' || key === 'returnTo') continue;
    if (typeof value === 'string') returnQuery.set(key, value);
  }
  const queryString = returnQuery.toString();
  const requestedPath = `${pathname}${queryString ? `?${queryString}` : ''}`;
  const navigationTheme = {
    ...DefaultTheme,
    fonts: NavigationFonts,
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.background,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hide();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (auth.status === 'anonymous' && isProtectedPath) router.replace({ pathname: '/autenticacion', params: { returnTo: requestedPath } });
  }, [auth.status, isProtectedPath, requestedPath]);

  if (!fontsLoaded && !fontError) {
    return null;
  }
  if (auth.status !== 'authenticated' && isProtectedPath) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <View style={styles.root}>
        <Stack
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: Typography.action,
            contentStyle: { backgroundColor: colors.background },
          }}>
          <Stack.Screen name="index" options={{ title: 'Inicio' }} />
          {Object.values(NavigationSections).map((section) => (
            <Stack.Screen key={section.name} name={section.name} options={{ title: section.title }} />
          ))}
          <Stack.Screen name="carrito" options={{ title: 'Carrito' }} />
          <Stack.Screen name="configuracion" options={{ title: 'Configuración' }} />
          <Stack.Screen name="cuenta/[seccion]" options={{ title: 'Mi cuenta' }} />
          <Stack.Screen name="+not-found" options={{ title: 'Página no encontrada' }} />
        </Stack>
        <BottomNavigation />
      </View>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
