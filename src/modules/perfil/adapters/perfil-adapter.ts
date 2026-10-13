import { record, text, nullableText } from '@/shared/adapters/validation';
import { AdapterError } from '@/shared/adapters/adapter-error';
import { InputError } from '@/shared/adapters/input-error';
import { SessionDataError } from '@/shared/adapters/session-data-error';
import type { Perfil } from '../models/perfil';
import type { NextAuthSession } from '@/modules/auth/models/autenticacion';
export function perfilResponse(value: unknown, expectedEmail?: string): Perfil {
  const dto = record(value, 'perfil');
  const fechaRegistro = dto.fecha_registro == null ? null : text(dto.fecha_registro, 'perfil.fecha_registro');
  if (fechaRegistro && !Number.isFinite(Date.parse(fechaRegistro))) throw new AdapterError('perfil.fecha_registro', 'fecha válida');
  const correo = text(dto.correo, 'perfil.correo');
  if (expectedEmail && correo !== expectedEmail) throw new SessionDataError('El perfil recibido no corresponde a tu sesión. Inicia sesión de nuevo.');
  return { nombre: text(dto.nombre, 'perfil.nombre'), correo, telefono: dto.telefono == null ? null : nullableText(dto.telefono, 'perfil.telefono'), fechaRegistro };
}
export function perfilSession(session: NextAuthSession): Pick<Perfil, 'nombre' | 'correo' | 'telefono'> {
  return { nombre: session.user.name ?? '', correo: session.user.email, telefono: session.user.telefono ?? null };
}
export function perfilRequest(nombre: string, telefono: string) {
  if (!nombre.trim() || nombre.trim().length > 200 || telefono.trim().length > 30) throw new InputError('Revisa el nombre y el teléfono.');
  return { nombre: nombre.trim(), telefono: telefono.trim() || null };
}
