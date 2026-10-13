import { fetchHttpClient, type HttpMutationClient, type RequestOptions } from '@/services/api';
import type { Perfil } from '@/modules/perfil/models/perfil';
import { comprasResponse, pedidoResponse } from '../adapters/ventas-adapter';
import { InputError } from '@/shared/adapters/input-error';
export class HttpVentasService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}
  async listar(options?: RequestOptions) { return comprasResponse(await this.http.get('/api/pedidos', options)); }
  async crear(metodoPago: string, perfil: Perfil) {
    if (!['transferencia', 'efectivo', 'tarjeta'].includes(metodoPago) || !perfil.nombre.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(perfil.correo)) throw new InputError('Revisa los datos del pedido.');
    return pedidoResponse((await this.http.request('/api/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ metodo_pago: metodoPago, nombre_cliente: perfil.nombre, correo_cliente: perfil.correo, telefono_cliente: perfil.telefono }) })).body);
  }
}
