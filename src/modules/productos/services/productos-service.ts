import { fetchHttpClient, type HttpClient, type RequestOptions } from '@/services/api';
import { adaptProductosRespuesta } from '../adapters/productos-adapter';
import type { Producto } from '../models/producto';
import { ModelNotFoundError } from '@/shared/adapters/adapter-error';

export interface ProductosService {
  listar(options?: RequestOptions): Promise<readonly Producto[]>;
  obtener(id: string, options?: RequestOptions): Promise<Producto>;
}

export class HttpProductosService implements ProductosService {
  constructor(private readonly client: HttpClient = fetchHttpClient) {}

  async listar(options?: RequestOptions): Promise<readonly Producto[]> {
    return adaptProductosRespuesta(await this.client.get('/api/productos', options));
  }

  async obtener(id: string, options?: RequestOptions): Promise<Producto> {
    const productos = await this.listar(options);
    const producto = productos.find((item) => item.id === id);
    if (!producto) throw new ModelNotFoundError('Producto', id);
    return producto;
  }
}
