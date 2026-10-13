import { HttpCursosService, type CursosService } from '@/modules/cursos/services/cursos-service';
import { HttpProductosService, type ProductosService } from '@/modules/productos/services/productos-service';
import { HttpServiciosService, type ServiciosService } from '@/modules/servicios/services/servicios-service';
import type { RequestOptions } from '@/services/api';

import type { DatosCatalogo } from '../models/catalogo';

export interface CatalogoService {
  obtener(options?: RequestOptions): Promise<DatosCatalogo>;
}

/** Composes models already adapted by the three public module services. */
export class ComposedCatalogoService implements CatalogoService {
  constructor(
    private readonly servicios: ServiciosService = new HttpServiciosService(),
    private readonly cursos: CursosService = new HttpCursosService(),
    private readonly productos: ProductosService = new HttpProductosService(),
  ) {}

  async obtener(options?: RequestOptions): Promise<DatosCatalogo> {
    const [Servicios, Cursos, Productos] = await Promise.all([
      this.servicios.listar(options), this.cursos.listar(options), this.productos.listar(options),
    ]);
    return { Servicios, Cursos, Productos };
  }
}
