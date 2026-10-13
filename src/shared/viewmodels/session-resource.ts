import { HttpError } from '@/services/api';
import { AdapterError } from '@/shared/adapters/adapter-error';
import { InputError } from '@/shared/adapters/input-error';
import { SessionDataError } from '@/shared/adapters/session-data-error';

export type OperationErrorKind = 'sesion' | 'permiso' | 'validacion' | 'servidor' | 'respuesta' | 'conexion';
export function operationError(error: unknown): { kind: OperationErrorKind; message: string } {
  if (error instanceof InputError) return { kind: 'validacion', message: error.message };
  if (error instanceof SessionDataError) return { kind: 'sesion', message: error.message };
  if (error instanceof HttpError) {
    const kind = error.status === 401 ? 'sesion' : error.status === 403 ? 'permiso' : error.status >= 500 ? 'servidor' : 'validacion';
    const body = typeof error.body === 'object' && error.body !== null ? error.body as Record<string, unknown> : {};
    const fallback = kind === 'sesion' ? 'Tu sesión expiró. Inicia sesión de nuevo.' : kind === 'permiso' ? 'Tu cuenta no tiene permiso para esta acción.' : kind === 'servidor' ? 'El servidor no pudo completar la solicitud.' : 'Revisa los datos e intenta de nuevo.';
    return { kind, message: `${typeof body.error === 'string' ? body.error : fallback} [${error.path.split('?')[0]}; HTTP ${error.status}]` };
  }
  return { kind: error instanceof AdapterError ? 'respuesta' : 'conexion', message: error instanceof AdapterError ? 'La respuesta recibida no pudo interpretarse. Intenta actualizar.' : error instanceof TypeError ? 'No fue posible conectar. Revisa tu conexión e intenta de nuevo.' : error instanceof Error ? error.message : 'No fue posible completar la solicitud.' };
}
export type SessionResourceState<T> = Readonly<{ datos: T | null; estadoCarga: 'cargando' | 'listo' | 'error'; error: string | null; tipoError: OperationErrorKind | null; ocupado: boolean; mensaje: string | null }>;

/** One resource per confirmed session revision; no user data is persisted globally. */
export class SessionResource<T> {
  private state: SessionResourceState<T>;
  private readonly listeners = new Set<() => void>();
  private generation = 0;
  private active = true;
  private lifetime = 0;
  private controller: AbortController | null = null;
  constructor(private readonly loader: (signal?: AbortSignal) => Promise<T>, private readonly authenticated: boolean, readonly sessionScope = '') {
    this.state = { datos: null, estadoCarga: authenticated ? 'cargando' : 'listo', error: null, tipoError: null, ocupado: false, mensaje: null };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private publish(value: Partial<SessionResourceState<T>>) { this.state = { ...this.state, ...value }; this.listeners.forEach((listener) => listener()); }
  activate = () => { this.active = true; };
  cancel = () => { this.active = false; this.lifetime++; this.generation++; this.controller?.abort(); this.state = { datos: null, estadoCarga: 'listo', error: null, tipoError: null, ocupado: false, mensaje: null }; };
  cargar = async (): Promise<void> => {
    if (!this.authenticated || !this.active) return;
    this.controller?.abort();
    this.controller = new AbortController();
    const current = ++this.generation;
    this.publish({ estadoCarga: 'cargando', error: null, tipoError: null });
    try {
      const datos = await this.loader(this.controller.signal);
      if (this.active && current === this.generation) this.publish({ datos, estadoCarga: 'listo' });
    } catch (error) {
      if (this.active && current === this.generation) {
        const failure = operationError(error);
        this.publish({ estadoCarga: 'error', error: failure.message, tipoError: failure.kind, ...(failure.kind === 'sesion' ? { datos: null } : {}) });
      }
    }
  };
  ejecutar = async <R>(operation: () => Promise<R>, message: string | ((result: R) => string), onConfirmed?: (result: R) => void): Promise<boolean> => {
    if (!this.authenticated || !this.active || this.state.ocupado) return false;
    const lifetime = this.lifetime;
    this.publish({ ocupado: true, error: null, tipoError: null, mensaje: null });
    try {
      const result = await operation();
      if (!this.active || lifetime !== this.lifetime) return false;
      this.publish({ mensaje: typeof message === 'function' ? message(result) : message });
      onConfirmed?.(result);
      await this.cargar();
      return this.active && lifetime === this.lifetime;
    } catch (error) {
      if (this.active && lifetime === this.lifetime) { const failure = operationError(error); this.publish({ error: failure.message, tipoError: failure.kind }); }
      return false;
    } finally { if (this.active && lifetime === this.lifetime) this.publish({ ocupado: false }); }
  };
}
