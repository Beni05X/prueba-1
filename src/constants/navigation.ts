import type { Href } from 'expo-router';

export const NavigationSections = {
  authentication: { name: 'autenticacion', href: '/autenticacion', title: 'Autenticación' },
  courses: { name: 'cursos', href: '/cursos', title: 'Cursos' },
  catalog: { name: 'catalogo', href: '/catalogo', title: 'Catálogo' },
  services: { name: 'servicios', href: '/servicios', title: 'Servicios' },
  schedule: { name: 'agenda', href: '/agenda', title: 'Agenda' },
  profile: { name: 'perfil', href: '/perfil', title: 'Perfil' },
} as const satisfies Record<string, { name: string; href: Href; title: string }>;
