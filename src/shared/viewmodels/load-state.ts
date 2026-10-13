import { AdapterError, ModelNotFoundError } from '../adapters/adapter-error';
import { HttpError } from '@/services/api';
import type { EstadoModulo } from '../models/view-state';

export type TipoErrorDatos = 'http' | 'adaptacion' | 'no-encontrado' | 'otro';

export function tipoErrorDatos(error: unknown): TipoErrorDatos {
  if (error instanceof HttpError) return 'http';
  if (error instanceof AdapterError) return 'adaptacion';
  if (error instanceof ModelNotFoundError) return 'no-encontrado';
  return 'otro';
}

/** Testable presentation state. It only consumes internal models from a port. */
export class LoadState<T> {
  private snapshot: EstadoModulo<T>;
  private failure: TipoErrorDatos | null = null;
  private readonly listeners = new Set<() => void>();
  private request = 0;

  constructor(initial: T, initialStatus: 'cargando' | 'listo' = 'listo') {
    this.snapshot = { datos: initial, estadoCarga: initialStatus, error: null };
  }

  getSnapshot = () => this.snapshot;
  getErrorType = () => this.failure;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private publish(snapshot: EstadoModulo<T>, failure: TipoErrorDatos | null = null) {
    this.snapshot = snapshot;
    this.failure = failure;
    this.listeners.forEach((listener) => listener());
  }

  cancel = () => { this.request += 1; };

  async load(operation: () => Promise<T>): Promise<void> {
    const current = ++this.request;
    this.publish({ ...this.snapshot, estadoCarga: 'cargando', error: null });
    try {
      const datos = await operation();
      if (current === this.request) this.publish({ datos, estadoCarga: 'listo', error: null });
    } catch (error) {
      if (current === this.request) {
        this.publish({ ...this.snapshot, estadoCarga: 'error', error: error instanceof Error ? error.message : 'No fue posible cargar los datos.' }, tipoErrorDatos(error));
      }
    }
  }
}
