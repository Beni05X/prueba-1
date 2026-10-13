import type { CursosService } from '../services/cursos-service';
import type { Curso } from '../models/curso';
import { LoadState } from '@/shared/viewmodels/load-state';

export class CursosViewModel extends LoadState<Curso | null> {
  constructor(private readonly service: CursosService, private readonly id?: string) {
    super(null, id === undefined ? 'listo' : 'cargando');
  }

  cargar = (signal?: AbortSignal) => this.id === undefined
    ? Promise.resolve()
    : this.load(() => this.service.obtener(this.id!, { signal }));
}
