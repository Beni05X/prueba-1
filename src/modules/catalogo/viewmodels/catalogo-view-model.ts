import type { CatalogoService } from '../services/catalogo-service';
import type { DatosCatalogo } from '../models/catalogo';
import { LoadState } from '@/shared/viewmodels/load-state';

export class CatalogoViewModel extends LoadState<DatosCatalogo> {
  constructor(private readonly service: CatalogoService) {
    super({ Servicios: [], Cursos: [], Productos: [] }, 'cargando');
  }

  cargar = (signal?: AbortSignal) => this.load(() => this.service.obtener({ signal }));
}
