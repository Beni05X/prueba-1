import { useCallback } from 'react';
import { HttpNotificacionesService } from '../services/notificaciones-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
const service = new HttpNotificacionesService();
export function useNotificacionesViewModel() {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []));
  return { ...vm, recordatorios: vm.datos ?? [] };
}
