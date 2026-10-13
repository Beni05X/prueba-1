import { AdapterError, ModelNotFoundError } from '@/shared/adapters/adapter-error';
import { fetchHttpClient, type HttpClient, type RequestOptions } from '@/services/api';
import { adaptCursosRespuesta } from '../adapters/cursos-adapter';
import type { Curso } from '../models/curso';

export interface CursosService {
  listar(options?: RequestOptions): Promise<readonly Curso[]>;
  obtener(id: string, options?: RequestOptions): Promise<Curso>;
}

export class HttpCursosService implements CursosService {
  constructor(private readonly client: HttpClient = fetchHttpClient) {}

  async listar(options?: RequestOptions): Promise<readonly Curso[]> {
    return adaptCursosRespuesta(await this.client.get('/api/cursos', options));
  }

  async obtener(id: string, options?: RequestOptions): Promise<Curso> {
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
      throw new AdapterError('curso.id', 'un identificador entero positivo seguro');
    }
    // The backend exposes no public course detail route. Use its verified list.
    const curso = (await this.listar(options)).find((item) => item.id === id);
    if (!curso) throw new ModelNotFoundError('curso', id);
    return curso;
  }
}
