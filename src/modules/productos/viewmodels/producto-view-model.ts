import { LoadState } from '@/shared/viewmodels/load-state';
import type { Producto } from '../models/producto';
import type { ProductosService } from '../services/productos-service';

export class ProductoViewModel extends LoadState<Producto | null> {
  constructor(private readonly service: ProductosService, private readonly id?: string) { super(null, id ? 'cargando' : 'listo'); }
  cargar = (signal?: AbortSignal) => this.load(async () => this.id ? this.service.obtener(this.id, { signal }) : null);
}
