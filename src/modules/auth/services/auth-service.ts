import { fetchHttpClient, type HttpMutationClient } from '@/services/api';
import { confirmarOk, registroRequest, registroResponse } from '../adapters/auth-adapter';
import type { CamposAutenticacion, RegistroConfirmado } from '../models/autenticacion';
import { authError } from '../adapters/auth-error-adapter';

export interface AuthService {
  registrar(campos: CamposAutenticacion): Promise<RegistroConfirmado>;
  recuperarContrasena(correo: string): Promise<void>;
  restablecerContrasena(token: string, password: string): Promise<void>;
  verificarCorreo(token: string): Promise<void>;
  reenviarVerificacion(correo: string): Promise<void>;
}

export class HttpAuthService implements AuthService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}

  async registrar(campos: CamposAutenticacion): Promise<RegistroConfirmado> {
    try {
      const response = await this.http.request('/api/auth/register', { method: 'POST', authenticated: false, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registroRequest(campos)) });
      return registroResponse(response.body, response.status);
    } catch (error) { throw authError(error, 'Registro'); }
  }

  async recuperarContrasena(correo: string): Promise<void> {
    await this.postOk('/api/auth/recuperar-contrasena', { correo: correo.trim() }, 'Recuperación');
  }

  async restablecerContrasena(token: string, password: string): Promise<void> {
    await this.postOk('/api/auth/reset-contrasena', { token, password }, 'Restablecimiento');
  }

  async verificarCorreo(token: string): Promise<void> {
    try {
      const response = await this.http.request(`/api/auth/verificar-email?token=${encodeURIComponent(token)}`, { authenticated: false });
      confirmarOk(response.body);
    } catch (error) { throw authError(error, 'Verificación de correo'); }
  }

  async reenviarVerificacion(correo: string): Promise<void> {
    await this.postOk('/api/auth/reenviar-verificacion', { correo: correo.trim() }, 'Reenvío de verificación');
  }

  private async postOk(path: string, body: Record<string, string>, operation: string): Promise<void> {
    try {
      const response = await this.http.request(path, { method: 'POST', authenticated: false, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      confirmarOk(response.body);
    } catch (error) { throw authError(error, operation); }
  }
}
export const authService = new HttpAuthService();
