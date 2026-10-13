import { Link, usePathname } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Icon } from '@/components/ui/icon';
import { Touchable } from '@/components/ui/touchable';
import { BottomNavigationItems, showsBottomNavigation } from '@/constants/navigation';
import { useTheme } from '@/hooks/use-theme';
import { Colors, IconSizes, Sizes, Spacing, Typography } from '@/theme';

export function BottomNavigation() {
  const pathname = usePathname();
  const theme = useTheme();
  if (!showsBottomNavigation(pathname)) return null;
  const activeHref = ['/catalogo', '/cursos', '/servicios'].includes(pathname) || pathname.startsWith('/productos/') ? '/catalogo'
    : pathname === '/agenda' ? '/agenda'
      : pathname === '/carrito' ? '/carrito'
        : pathname === '/perfil' || pathname === '/configuracion' || pathname.startsWith('/cuenta/') ? '/perfil'
          : '/';

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.surface, { backgroundColor: theme.backgroundElement, borderTopColor: theme.border }]}>
      <View style={styles.bar} accessibilityRole="tablist">
        {BottomNavigationItems.map((item) => {
          const selected = item.href === activeHref;
          const color = selected ? theme.primary : theme.inactive;
          return (
            <Link key={item.href} href={item.href} replace asChild>
              <Touchable
                selected={selected}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected }}
                style={styles.item}>
                <Icon name={item.icon} size={IconSizes.medium} color={color} />
                <ThemedText style={[Typography.tab, { color }, styles.label]}>{item.label}</ThemedText>
              </Touchable>
            </Link>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  surface: { backgroundColor: Colors.background, borderTopWidth: Sizes.borderWidth, borderTopColor: Colors.border },
  bar: { width: '100%', maxWidth: Sizes.maxContentWidth, alignSelf: 'center', flexDirection: 'row', minHeight: Sizes.tabBarMinHeight, paddingHorizontal: Spacing.one },
  item: { flex: 1, minWidth: Sizes.touchMinWidth, minHeight: Sizes.tabBarMinHeight, alignItems: 'center', justifyContent: 'center', gap: Spacing.one, paddingVertical: Spacing.two },
  label: { textAlign: 'center' },
});
