import { fetchHttpClient, type HttpMutationClient, type RequestOptions } from '@/services/api';
import { preguntasResponse, contactoResponse } from '../adapters/informacion-adapter';
export class HttpInformacionService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}
  async preguntas(options?: RequestOptions) {
    return preguntasResponse((await this.http.request('/api/faq', { ...options, authenticated: false })).body);
  }
  async contacto(options?: RequestOptions) {
    return contactoResponse((await this.http.request('/api/config-sitio', { ...options, authenticated: false })).body);
  }
}
