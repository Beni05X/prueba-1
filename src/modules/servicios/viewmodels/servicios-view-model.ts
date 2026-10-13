import type { ServiciosService } from '../services/servicios-service';
import type { Servicio } from '../models/servicio';
import { LoadState } from '@/shared/viewmodels/load-state';

export class ServiciosViewModel extends LoadState<Servicio | null> {
  constructor(private readonly service: ServiciosService, private readonly id?: string) {
    super(null, id === undefined ? 'listo' : 'cargando');
  }

  cargar = (signal?: AbortSignal) => this.id === undefined
    ? Promise.resolve()
    : this.load(() => this.service.obtener(this.id!, { signal }));
}
