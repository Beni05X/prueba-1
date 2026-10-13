import { useCallback } from 'react';
import { HttpInscripcionesService } from '../services/inscripciones-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
const service = new HttpInscripcionesService();
export function useMisCursosViewModel() {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []));
  return { ...vm, cursos: vm.datos ?? [] };
}
