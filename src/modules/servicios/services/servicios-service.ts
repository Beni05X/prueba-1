import { AdapterError } from '@/shared/adapters/adapter-error';
import { fetchHttpClient, type HttpClient, type RequestOptions } from '@/services/api';
import { adaptServiciosRespuesta, adaptServicioDetalle } from '../adapters/servicios-adapter';
import type { Servicio } from '../models/servicio';

export interface ServiciosService {
  listar(options?: RequestOptions): Promise<readonly Servicio[]>;
  obtener(id: string, options?: RequestOptions): Promise<Servicio>;
}

export class HttpServiciosService implements ServiciosService {
  constructor(private readonly client: HttpClient = fetchHttpClient) {}

  async listar(options?: RequestOptions): Promise<readonly Servicio[]> {
    return adaptServiciosRespuesta(await this.client.get('/api/servicios', options));
  }

  async obtener(id: string, options?: RequestOptions): Promise<Servicio> {
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
      throw new AdapterError('servicio.id', 'un identificador entero positivo seguro');
    }
    const servicio = adaptServicioDetalle(await this.client.get(`/api/servicios/${encodeURIComponent(id)}`, options));
    if (servicio.id !== id) throw new AdapterError('servicio.id', 'el identificador solicitado');
    return servicio;
  }
}
