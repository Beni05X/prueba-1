import { fetchHttpClient, type HttpMutationClient, type RequestOptions } from '@/services/api';
import { apiId } from '@/shared/adapters/account-validation';
import { misCursosResponse, inscripcionResponse } from '../adapters/inscripciones-adapter';
export class HttpInscripcionesService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}
  async listar(options?: RequestOptions) { return misCursosResponse(await this.http.get('/api/mis-cursos', options)); }
  async inscribir(id: string) { return inscripcionResponse((await this.http.request('/api/cursos/' + apiId(id) + '/inscribir', { method: 'POST' })).body); }
}
