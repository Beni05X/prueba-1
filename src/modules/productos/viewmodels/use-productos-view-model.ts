import type { Producto } from '@/modules/productos/models/producto';
import type { EstadoProductos } from './productos-state';
import { formatPrice } from '@/utils/format-price';
import type { Href } from 'expo-router';
import { usePaginationViewModel } from '@/shared/viewmodels/use-pagination-view-model';
export function useProductosViewModel(productos: readonly Producto[], resetKey: string) {
  const estado: EstadoProductos = { datos: productos, estadoCarga: 'listo', error: null };
  const pagination = usePaginationViewModel(productos, resetKey);
  return { estado, cargando: false, error: estado.error, pagination,
    tarjetas: pagination.items.map((producto) => ({
      id: producto.id, title: producto.nombre, description: producto.descripcion ?? undefined,
      price: formatPrice(producto.precio), kind: 'product' as const,
      href: { pathname: '/productos/[id]', params: { id: producto.id } } as unknown as Href,
      image: producto.imagen,
    })),
  };
}
