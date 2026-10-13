import { fetchHttpClient, type HttpMutationClient, type RequestOptions } from '@/services/api';
import { confirmarOk } from '@/modules/auth/adapters/auth-adapter';
import { perfilRequest, perfilResponse } from '../adapters/perfil-adapter';
import { record } from '@/shared/adapters/validation';
export class HttpPerfilService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}
  async obtener(options?: RequestOptions, expectedEmail?: string) { return perfilResponse(await this.http.get('/api/usuario/perfil', options), expectedEmail); }
  async guardar(nombre: string, telefono: string) {
    const result = await this.http.request('/api/usuario/perfil', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(perfilRequest(nombre, telefono)) });
    confirmarOk(result.body);
    perfilResponse(record(result.body, 'perfil.guardado').user);
  }
}
