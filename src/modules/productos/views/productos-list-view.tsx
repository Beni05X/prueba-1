import { CatalogCard } from '@/components/ui/style-guide';
import { PaginationControls } from '@/components/ui/pagination-controls';
import type { Producto } from '@/modules/productos/models/producto';
import { useProductosViewModel } from '@/modules/productos/viewmodels/use-productos-view-model';
export function ProductosListView({ productos, resetKey }: { productos: readonly Producto[]; resetKey: string }) {
  const { tarjetas, pagination } = useProductosViewModel(productos, resetKey);
  return <>{tarjetas.map(({ id, ...card }) => <CatalogCard key={id} {...card} />)}<PaginationControls {...pagination} /></>;
}
