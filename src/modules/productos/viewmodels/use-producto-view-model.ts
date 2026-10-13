import { useMemo, useState } from 'react';
import { HttpProductosService, type ProductosService } from '@/modules/productos/services/productos-service';
import { useLoadState } from '@/shared/viewmodels/use-load-state';
import { ProductoViewModel } from './producto-view-model';

const defaultService: ProductosService = new HttpProductosService();
export function useProductoViewModel(id?: string, service: ProductosService = defaultService) {
  const vm = useMemo(() => new ProductoViewModel(service, id), [service, id]);
  const { estado } = useLoadState(vm);
  const [variantId, setVariantId] = useState<string | null>(null);
  const producto = estado.datos;
  const selected = producto?.variantes.find((variant) => variant.id === variantId) ?? producto?.variantes[0] ?? null;
  return {
    producto, selected, variantId: selected?.id ?? null,
    seleccionarVariante: setVariantId,
    cargando: estado.estadoCarga === 'cargando', error: estado.error,
    recargar: () => vm.cargar(),
    estado: estado.estadoCarga,
  };
}
