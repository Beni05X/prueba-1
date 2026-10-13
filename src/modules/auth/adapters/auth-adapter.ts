import { AdapterError } from '@/shared/adapters/adapter-error';
import type { CamposAutenticacion, NextAuthSession, RegistroConfirmado } from '../models/autenticacion';

export function registroRequest(campos: CamposAutenticacion) {
  return { name: campos.nombre.trim(), email: campos.correo.trim(), password: campos.password, telefono: campos.telefono.trim() };
}

export function registroResponse(value: unknown, status: number): RegistroConfirmado {
  if (status !== 201 || typeof value !== 'object' || value === null || !('message' in value) || typeof value.message !== 'string' || !value.message.trim() || !('requiresVerification' in value) || typeof value.requiresVerification !== 'boolean') {
    throw new AdapterError('registro', 'confirmación 201 de creación y requiresVerification');
  }
  return { message: value.message, requiresVerification: value.requiresVerification };
}

export function confirmarOk(value: unknown): void {
  if (typeof value !== 'object' || value === null || !('ok' in value) || value.ok !== true) throw new AdapterError('autenticación', 'confirmación ok: true');
}

export function sessionResponse(value: unknown): NextAuthSession | null {
  if (value === null || (typeof value === 'object' && value !== null && Object.keys(value).length === 0)) return null;
  if (typeof value !== 'object' || value === null || !('expires' in value) || !('user' in value)) throw new AdapterError('sesión', 'sesión NextAuth válida');
  const { expires, user } = value;
  if (typeof expires !== 'string' || !Number.isFinite(Date.parse(expires))) throw new AdapterError('sesión', 'fecha de expiración válida');
  if (Date.parse(expires) <= Date.now()) return null;
  if (typeof user !== 'object' || user === null || !('id' in user) || typeof user.id !== 'string' || !user.id || !('email' in user) || typeof user.email !== 'string' || !user.email) throw new AdapterError('sesión', 'usuario con id y correo');
  return value as NextAuthSession;
}

export function confirmarPerfil(value: unknown, session: NextAuthSession): void {
  if (typeof value !== 'object' || value === null || !('nombre' in value) || typeof value.nombre !== 'string' || !('correo' in value) || value.correo !== session.user.email) throw new AdapterError('perfil', 'perfil correspondiente a la sesión confirmada');
}
