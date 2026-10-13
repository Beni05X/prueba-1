import type { Href } from 'expo-router';
import type { EstadoModulo } from '@/shared/models/view-state';

export type ModuloCuenta = 'ventas' | 'cursos' | 'favoritos' | 'informacion' | 'autenticacion' | 'perfil' | 'notificaciones' | 'configuracion' | 'vacia';

export type DestinoCuenta = Readonly<{ seccion: string; modulo: ModuloCuenta; titulo: string; backHref?: Href }>;

export type EstadoCuenta = EstadoModulo<DestinoCuenta>;

// Preserve the existing dynamic route and all of its section titles/back links.
export const PAGINAS_CUENTA: readonly DestinoCuenta[] = [
  { seccion: 'restablecer-contrasena', modulo: 'autenticacion', titulo: 'Restablecer contraseña', backHref: '/autenticacion' },
  { seccion: 'verificar-email', modulo: 'autenticacion', titulo: 'Verificar correo', backHref: '/autenticacion' },
  {
    "seccion": "compras",
    "modulo": "ventas",
    "titulo": "Mis compras",
    "backHref": "/perfil"
  },
  {
    "seccion": "cursos",
    "modulo": "cursos",
    "titulo": "Mis cursos",
    "backHref": "/perfil"
  },
  {
    "seccion": "favoritos",
    "modulo": "favoritos",
    "titulo": "Favoritos",
    "backHref": "/perfil"
  },
  {
    "seccion": "ayuda",
    "modulo": "informacion",
    "titulo": "Ayuda",
    "backHref": "/perfil"
  },
  {
    "seccion": "legal",
    "modulo": "informacion",
    "titulo": "Legal",
    "backHref": "/perfil"
  },
  {
    "seccion": "acerca",
    "modulo": "informacion",
    "titulo": "Acerca de la app",
    "backHref": "/perfil"
  },
  {
    "seccion": "cerrar-sesion",
    "modulo": "autenticacion",
    "titulo": "Mi perfil"
  },
  {
    "seccion": "editar-perfil",
    "modulo": "perfil",
    "titulo": "Editar perfil",
    "backHref": "/perfil"
  },
  {
    "seccion": "notificaciones",
    "modulo": "notificaciones",
    "titulo": "Notificaciones",
    "backHref": "/configuracion"
  },
  {
    "seccion": "apariencia",
    "modulo": "configuracion",
    "titulo": "Apariencia",
    "backHref": "/configuracion"
  },
  {
    "seccion": "idioma",
    "modulo": "configuracion",
    "titulo": "Idioma",
    "backHref": "/configuracion"
  },
  {
    "seccion": "metodos-pago",
    "modulo": "configuracion",
    "titulo": "Métodos de pago",
    "backHref": "/configuracion"
  },
  {
    "seccion": "seguridad",
    "modulo": "configuracion",
    "titulo": "Seguridad",
    "backHref": "/configuracion"
  },
  {
    "seccion": "cambiar-contrasena",
    "modulo": "autenticacion",
    "titulo": "Cambiar contraseña",
    "backHref": "/configuracion"
  },
  {
    "seccion": "sesiones",
    "modulo": "configuracion",
    "titulo": "Mi sesión",
    "backHref": "/configuracion"
  },
  {
    "seccion": "eliminar-cuenta",
    "modulo": "autenticacion",
    "titulo": "Eliminar cuenta",
    "backHref": "/configuracion"
  },
  {
    "seccion": "recuperar-contrasena",
    "modulo": "autenticacion",
    "titulo": "Recuperar contraseña",
    "backHref": "/autenticacion"
  },
  {
    "seccion": "crear-cuenta",
    "modulo": "autenticacion",
    "titulo": "Crear cuenta",
    "backHref": "/autenticacion"
  },
  {
    "seccion": "privacidad",
    "modulo": "informacion",
    "titulo": "Aviso de privacidad",
    "backHref": "/cuenta/legal"
  },
  {
    "seccion": "terminos",
    "modulo": "informacion",
    "titulo": "Términos y condiciones",
    "backHref": "/cuenta/legal"
  },
  {
    "seccion": "cancelaciones",
    "modulo": "informacion",
    "titulo": "Cancelaciones y reembolsos",
    "backHref": "/cuenta/legal"
  },
  {
    "seccion": "reembolsos",
    "modulo": "informacion",
    "titulo": "Cancelaciones y reembolsos",
    "backHref": "/cuenta/legal"
  },
  {
    "seccion": "cookies",
    "modulo": "informacion",
    "titulo": "Política de cookies",
    "backHref": "/cuenta/legal"
  }
];
