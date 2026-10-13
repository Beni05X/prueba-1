import { AuthError } from '../models/auth-error';

const messages: Record<string, string> = {
  CredentialsSignin: 'El servidor rechazó las credenciales. Revisa tu correo y contraseña.',
  EMAIL_NOT_VERIFIED: 'Verifica tu correo electrónico antes de iniciar sesión.',
  ACCOUNT_LOCKED: 'Tu cuenta está bloqueada. Contacta al administrador.',
  ACCOUNT_INACTIVE: 'Tu cuenta está desactivada. Contacta al administrador.',
  WRONG_PASSWORD: 'El servidor rechazó la contraseña.',
  USER_NOT_FOUND: 'No existe una cuenta con ese correo.',
  CallbackRouteError: 'El servidor rechazó el acceso sin indicar el motivo específico. Puedes recuperar tu contraseña o reenviar la verificación.',
};

export function confirmarProveedor(value: unknown): void {
  const provider = typeof value === 'object' && value !== null && 'credentials' in value ? value.credentials : null;
  if (typeof provider !== 'object' || provider === null || !('type' in provider) || provider.type !== 'credentials') {
    throw new AuthError('El servidor no ofrece el proveedor de credenciales configurado.', 'PROVIDER_NOT_CONFIGURED', undefined, '/api/auth/providers');
  }
}

export function confirmarCallback(value: unknown, status: number, path: string, baseUrl: string): void {
  if (typeof value !== 'object' || value === null) throw new AuthError('El servidor no confirmó la operación.', undefined, status, path);
  if ('error' in value && typeof value.error === 'string' && value.error) {
    throw new AuthError(value.error, 'code' in value && typeof value.code === 'string' ? value.code : value.error, status, path);
  }
  if (!('url' in value) || typeof value.url !== 'string') throw new AuthError('El servidor no devolvió la respuesta esperada de NextAuth.', undefined, status, path);
  let url: URL;
  try { url = new URL(value.url, baseUrl); } catch { throw new AuthError('El servidor devolvió una respuesta inválida de NextAuth.', undefined, status, path); }
  const error = url.searchParams.get('error');
  if (!error) return;
  const code = url.searchParams.get('code') || error;
  const safeCode = /^[a-zA-Z_][a-zA-Z_0-9]{0,63}$/.test(code) ? code : 'AUTH_ERROR';
  throw new AuthError(messages[safeCode] ?? messages[error] ?? 'El servidor rechazó la operación de autenticación.', safeCode, status, path);
}
