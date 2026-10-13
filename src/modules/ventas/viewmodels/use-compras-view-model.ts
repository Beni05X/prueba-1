import { useCallback } from 'react';
import { HttpVentasService } from '../services/ventas-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
const service = new HttpVentasService();
export function useComprasViewModel() {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []));
  return { ...vm, compras: vm.datos ?? [] };
}
