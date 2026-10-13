import { useThemePreferences } from '@/theme/theme-preference-provider';

export function useTheme() {
  return useThemePreferences().colors;
}
