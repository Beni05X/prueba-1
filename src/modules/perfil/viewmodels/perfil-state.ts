import type { Href } from 'expo-router';
import type { EstadoModulo } from '@/shared/models/view-state';
import type { Perfil } from '../models/perfil';

export type AccesoPerfil = Readonly<{ label: string; href: Href; emphasized?: boolean }>;

export type EstadoPerfil = EstadoModulo<Perfil>;

export type EstadoEdicionPerfil = EstadoModulo<Perfil>;

export const accesosPerfil: readonly AccesoPerfil[] = [
  { label: 'Mis compras', href: '/cuenta/compras' },
  { label: 'Mis cursos', href: '/cuenta/cursos' },
  { label: 'Mis citas', href: '/agenda' },
  { label: 'Favoritos', href: '/cuenta/favoritos' },
  { label: 'Configuración', href: '/configuracion', emphasized: true },
  { label: 'Ayuda', href: '/cuenta/ayuda' },
  { label: 'Legal', href: '/cuenta/legal' },
  { label: 'Acerca de la aplicación', href: '/cuenta/acerca' },
];
