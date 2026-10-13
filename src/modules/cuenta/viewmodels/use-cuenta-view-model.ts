import { PAGINAS_CUENTA, type DestinoCuenta, type EstadoCuenta } from '@/modules/cuenta/viewmodels/cuenta-state';

export function useCuentaViewModel(seccion: string | string[] | undefined) {
  const section = typeof seccion === 'string' ? seccion : '';
  const destino: DestinoCuenta = PAGINAS_CUENTA.find((page) => page.seccion === section)
    ?? { seccion: section, modulo: 'vacia', titulo: 'Mi cuenta', backHref: '/perfil' };
  // Route-derived state must update with the current parameter, without duplicating local form state.
  const estado: EstadoCuenta = { datos: destino, estadoCarga: 'listo', error: null };
  return { estado, destino: estado.datos };
}
