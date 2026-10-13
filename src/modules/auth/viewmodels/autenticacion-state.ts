import type { EstadoModulo } from '@/shared/models/view-state';
import type { CamposAutenticacion } from '../models/autenticacion';

export const SECCIONES_AUTENTICACION = ['crear-cuenta', 'recuperar-contrasena', 'restablecer-contrasena', 'verificar-email', 'cambiar-contrasena', 'cerrar-sesion', 'eliminar-cuenta'] as const;

export type SeccionAutenticacion = (typeof SECCIONES_AUTENTICACION)[number];

export type EstadoAutenticacion = EstadoModulo<CamposAutenticacion>;

export const camposIniciales: CamposAutenticacion = {
  nombre: '', correo: '', telefono: '', password: '', confirmacionPassword: '', passwordActual: '', confirmacionEliminar: '',
};
