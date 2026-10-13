import { fetchHttpClient, type HttpClient, type RequestOptions } from '@/services/api';
import { transferenciaResponse } from '../adapters/transferencia-adapter';
export class HttpTransferenciaService {
  constructor(private readonly http: HttpClient = fetchHttpClient) {}
  async obtener(options?: RequestOptions) { return transferenciaResponse(await this.http.get('/api/config-sitio', options)); }
}
