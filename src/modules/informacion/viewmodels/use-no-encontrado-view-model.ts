import { paginaNoEncontrada, type PaginaNoEncontrada } from '@/modules/informacion/viewmodels/informacion-state';
import type { EstadoModulo } from '@/shared/models/view-state';

export function useNoEncontradoViewModel() {
  const estado: EstadoModulo<PaginaNoEncontrada> = { datos: paginaNoEncontrada, estadoCarga: 'listo', error: null };
  return { estado, pagina: estado.datos, inicioHref: '/' as const };
}
