import { fetchHttpClient, type HttpMutationClient, type RequestOptions } from '@/services/api';
import { confirmarOk } from '@/modules/auth/adapters/auth-adapter';
import { record, identifier } from '@/shared/adapters/validation';
import { apiId, integer } from '@/shared/adapters/account-validation';
import { carritoResponse } from '../adapters/carrito-adapter';
export class HttpCarritoService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}
  async obtener(options?: RequestOptions) { return carritoResponse(await this.http.get('/api/carrito', options)); }
  async agregar(varianteId: string, cantidad = 1) {
    const result = await this.http.request('/api/carrito', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ variante_id: apiId(varianteId), cantidad: integer(cantidad, 'cantidad', 1) }) });
    confirmarOk(result.body);
    const item = record(record(result.body, 'carrito.agregado').item, 'carrito.item');
    identifier(item.id, 'carrito.item.id'); integer(item.cantidad, 'carrito.item.cantidad', 1);
  }
  async cantidad(id: string, cantidad: number) {
    const result = await this.http.request('/api/carrito', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: apiId(id), cantidad: integer(cantidad, 'cantidad') }) });
    confirmarOk(result.body);
    const dto = record(result.body, 'carrito.cantidad');
    if (cantidad > 0) integer(record(dto.item, 'carrito.item').count, 'carrito.item.count', 1);
    else if (dto.eliminado !== true) throw new Error('El servidor no confirmó la eliminación.');
  }
  async eliminar(id?: string) {
    const result = await this.http.request('/api/carrito' + (id ? '?id=' + apiId(id) : ''), { method: 'DELETE' });
    confirmarOk(result.body);
  }
}
