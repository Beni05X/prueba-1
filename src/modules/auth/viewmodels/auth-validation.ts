import type { CamposAutenticacion, ErroresAutenticacion } from '../models/autenticacion';

export function validarCorreo(correo: string): ErroresAutenticacion {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim()) ? {} : { correo: 'Ingresa un correo electrónico válido.' };
}
export function validarAcceso(campos: CamposAutenticacion): ErroresAutenticacion {
  const errors = validarCorreo(campos.correo);
  if (!campos.password) errors.password = 'Ingresa tu contraseña.';
  return errors;
}
export function validarNuevaContrasena(campos: CamposAutenticacion): ErroresAutenticacion {
  const errors: ErroresAutenticacion = {};
  if (campos.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres.';
  if (!campos.confirmacionPassword || campos.password !== campos.confirmacionPassword) errors.confirmacionPassword = 'Las contraseñas deben coincidir.';
  return errors;
}
export function validarRegistro(campos: CamposAutenticacion): ErroresAutenticacion {
  const errors = { ...validarCorreo(campos.correo), ...validarNuevaContrasena(campos) };
  if (!campos.nombre.trim()) errors.nombre = 'Ingresa tu nombre.';
  if (!campos.telefono.trim()) errors.telefono = 'Ingresa tu teléfono.';
  return errors;
}
export class SubmissionGate {
  private pending = false;
  async run(action: () => Promise<void>): Promise<void> {
    if (this.pending) return;
    this.pending = true;
    try { await action(); } finally { this.pending = false; }
  }
}
