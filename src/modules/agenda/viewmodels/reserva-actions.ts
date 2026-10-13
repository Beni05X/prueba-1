import { HttpError } from '@/services/api';
import { InputError } from '@/shared/adapters/input-error';
export function conflictoDisponibilidad(error: unknown): boolean {
  if (!(error instanceof HttpError) || error.status !== 409) return false;
  const body = error.body as { error?: unknown } | null;
  return typeof body?.error === 'string' && /hora|ocupad|disponib|atiende/i.test(body.error);
}
export async function reservarConDisponibilidad<T>(operation: () => Promise<T>, reload: () => Promise<void>, clear: () => void): Promise<T> {
  try { return await operation(); } catch (error) {
    if (conflictoDisponibilidad(error)) {
      clear(); await reload();
      throw new InputError('La disponibilidad cambió. Selecciona otra fecha u hora antes de confirmar.');
    }
    throw error;
  }
}
