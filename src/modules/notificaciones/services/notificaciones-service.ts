import { fetchHttpClient, type HttpClient, type RequestOptions } from '@/services/api';
import { recordatoriosResponse } from '../adapters/notificaciones-adapter';
export class HttpNotificacionesService {
  constructor(private readonly http: HttpClient = fetchHttpClient) {}
  async listar(options?: RequestOptions) { return recordatoriosResponse(await this.http.get('/api/usuario/recordatorios', options)); }
}
