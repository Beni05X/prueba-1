import { HttpError } from '@/services/api';
import { AuthError } from '../models/auth-error';

export function authError(error: unknown, operation?: string): AuthError {
  if (error instanceof AuthError) {
    if (!operation || error.operation) return error;
    return new AuthError(error.message, error.code, error.status, error.path, operation);
  }
  if (error instanceof HttpError) {
    const record = typeof error.body === 'object' && error.body !== null ? error.body as Record<string, unknown> : {};
    const fallback = error.status === 429 ? 'Demasiadas solicitudes. Intenta de nuevo en unos minutos.'
      : error.status === 409 ? 'Ya existe una cuenta con ese correo.'
        : error.status === 400 ? 'Revisa los datos ingresados.'
          : error.status >= 500 ? 'El servidor no pudo procesar la solicitud. Intenta más tarde.'
            : 'El servidor rechazó la solicitud.';
    return new AuthError(typeof record.error === 'string' ? record.error : fallback, typeof record.code === 'string' ? record.code : undefined, error.status, error.path.split('?')[0], operation);
  }
  return new AuthError(error instanceof Error && !(error instanceof TypeError) ? error.message : 'No fue posible conectar con el servidor. Revisa tu conexión.', undefined, undefined, undefined, operation);
}

export function authErrorMessage(error: AuthError): string {
  const location = error.path && error.status !== undefined ? ` [${error.path}; HTTP ${error.status}]` : '';
  return `${error.operation ? `${error.operation}: ` : ''}${error.message}${location}`;
}
