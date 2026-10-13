import type { Href } from 'expo-router';
import type { EstadoModulo } from '@/shared/models/view-state';
import type { Apariencia } from '../models/configuracion';

export type AccesoConfiguracion = Readonly<{ label: string; description?: string; href: Href; emphasized?: boolean; destructive?: boolean }>;

export const APARIENCIAS = [
  { label: 'Claro', description: 'Recomendado para espacios iluminados' },
  { label: 'Oscuro', description: 'Reduce el brillo en ambientes oscuros' },
  { label: 'Automático', description: 'Usa la configuración de tu dispositivo' },
] as const;

export type DatosConfiguracion = Readonly<{ preferencias: readonly AccesoConfiguracion[]; seguridad: readonly AccesoConfiguracion[] }>;

export type EstadoConfiguracion = EstadoModulo<DatosConfiguracion> & Readonly<{ apariencia: Apariencia }>;

export const accesosConfiguracion: DatosConfiguracion = {
  preferencias: [
    { label: 'Notificaciones', description: 'Consulta tus recordatorios', href: '/cuenta/notificaciones', emphasized: true },
    { label: 'Apariencia', description: 'Claro · Oscuro · Automático', href: '/cuenta/apariencia', emphasized: true },
    { label: 'Idioma', description: 'Español', href: '/cuenta/idioma', emphasized: true },
    { label: 'Métodos de pago', description: 'Elige cómo pagar tu pedido', href: '/cuenta/metodos-pago', emphasized: true },
  ],
  seguridad: [
    { label: 'Cambiar contraseña', href: '/cuenta/cambiar-contrasena' },
    { label: 'Mi sesión', href: '/cuenta/sesiones' },
    { label: 'Eliminar cuenta', href: '/cuenta/eliminar-cuenta', destructive: true },
  ],
};
