import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/theme';
import type { Apariencia } from '@/modules/configuracion/models/configuracion';

const APPEARANCE_KEY = 'brenns.preference.appearance';
const NOTIFICATIONS_KEY = 'brenns.preference.notifications';
type Palette = { [Key in keyof typeof Colors]: string };
const darkColors: Palette = {
  ...Colors,
  text: '#F7F2F5', textSecondary: '#C0B7BD', background: '#171417',
  backgroundElement: '#231F23', backgroundSelected: '#30282E', border: '#403940',
  inactive: '#AAA1A7', primarySoft: '#4B2638', success: '#58C38E',
};
type Preferences = {
  appearance: Apariencia;
  notificationsEnabled: boolean;
  setAppearance(value: Apariencia): Promise<void>;
  setNotificationsEnabled(value: boolean): Promise<void>;
  colors: Palette;
  isDark: boolean;
};
const PreferenceContext = createContext<Preferences | null>(null);

export function ThemePreferenceProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [appearance, setAppearanceState] = useState<Apariencia>('Automático');
  const [notificationsEnabled, setNotificationsState] = useState(false);
  useEffect(() => {
    void AsyncStorage.multiGet([APPEARANCE_KEY, NOTIFICATIONS_KEY]).then((entries) => {
      const values = new Map(entries);
      const savedAppearance = values.get(APPEARANCE_KEY);
      if (savedAppearance === 'Claro' || savedAppearance === 'Oscuro' || savedAppearance === 'Automático') setAppearanceState(savedAppearance);
      setNotificationsState(values.get(NOTIFICATIONS_KEY) === 'true');
    }).catch(() => {});
  }, []);
  const setAppearance = useCallback(async (value: Apariencia) => {
    await AsyncStorage.setItem(APPEARANCE_KEY, value);
    setAppearanceState(value);
  }, []);
  const setNotificationsEnabled = useCallback(async (value: boolean) => {
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, String(value));
    setNotificationsState(value);
  }, []);
  const isDark = appearance === 'Oscuro' || (appearance === 'Automático' && systemScheme === 'dark');
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);
  const colors: Palette = isDark ? darkColors : Colors;
  const context = useMemo(() => ({ appearance, notificationsEnabled, setAppearance, setNotificationsEnabled, colors, isDark }), [appearance, notificationsEnabled, setAppearance, setNotificationsEnabled, colors, isDark]);
  return <PreferenceContext.Provider value={context}>{children}</PreferenceContext.Provider>;
}

export function useThemePreferences() {
  const value = useContext(PreferenceContext);
  if (!value) throw new Error('useThemePreferences debe usarse dentro de ThemePreferenceProvider.');
  return value;
}
