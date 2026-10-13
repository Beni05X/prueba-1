import { useCallback } from 'react';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { HttpCarritoService } from '@/modules/carrito/services/carrito-service';
import type { VarianteProducto } from '../models/producto';
const service = new HttpCarritoService();
export function useCarritoProductoViewModel(selected: VarianteProducto | null) {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.obtener({ signal }), []));
  return { ...vm, agregar: () => selected && selected.stock > 0 ? vm.ejecutar(() => service.agregar(selected.id), 'Variante agregada al carrito.') : Promise.resolve(false) };
}
