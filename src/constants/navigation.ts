import type { Href } from 'expo-router';

export const NavigationSections = {
  authentication: { name: 'autenticacion', href: '/autenticacion', title: 'Autenticación' },
  courses: { name: 'cursos', href: '/cursos', title: 'Cursos' },
  catalog: { name: 'catalogo', href: '/catalogo', title: 'Catálogo' },
  services: { name: 'servicios', href: '/servicios', title: 'Servicios' },
  schedule: { name: 'agenda', href: '/agenda', title: 'Agenda' },
  profile: { name: 'perfil', href: '/perfil', title: 'Perfil' },
} as const satisfies Record<string, { name: string; href: Href; title: string }>;

// Keep the public routes intact; this is the five-option menu in the reference PDF.
export const BottomNavigationItems = [
  { href: '/', label: 'Inicio', icon: 'home' },
  { href: '/catalogo', label: 'Catálogo', icon: 'catalog' },
  { href: '/agenda', label: 'Agenda', icon: 'agenda' },
  { href: '/carrito', label: 'Carrito', icon: 'cart' },
  { href: '/perfil', label: 'Perfil', icon: 'profile' },
] as const satisfies readonly { href: Href; label: string; icon: string }[];

export function showsBottomNavigation(pathname: string) {
  const authenticationPages = ['/autenticacion', '/cuenta/crear-cuenta', '/cuenta/recuperar-contrasena', '/cuenta/restablecer-contrasena', '/cuenta/verificar-email', '/reset-contrasena', '/verificar-email'];
  if (authenticationPages.includes(pathname)) return false;
  return pathname === '/' || Object.values(NavigationSections).some((section) => section.href === pathname)
    || pathname === '/carrito' || pathname === '/configuracion' || pathname.startsWith('/cuenta/');
}
