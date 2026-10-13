import { fetchHttpClient, type HttpMutationClient, type RequestOptions } from '@/services/api';
import { confirmarOk } from '@/modules/auth/adapters/auth-adapter';
import { citasResponse, horariosResponse, diasBloqueadosResponse } from '../adapters/agenda-adapter';
import { record, identifier, decimal } from '@/shared/adapters/validation';
import { apiId, day, hour } from '@/shared/adapters/account-validation';
import type { ReservaCreada } from '../models/cita';
export class HttpAgendaService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}
  async listar(options?: RequestOptions) { return citasResponse(await this.http.get('/api/citas', options)); }
  async diasBloqueados(options?: RequestOptions) { return diasBloqueadosResponse(await this.http.get('/api/dias-bloqueados', options)); }
  async horarios(servicioId: string, fecha: string, options?: RequestOptions, empleadoId?: string) {
    const query = new URLSearchParams({ servicioId: String(apiId(servicioId)), fecha: day(fecha) });
    if (empleadoId) query.set('empleadoId', String(apiId(empleadoId)));
    return horariosResponse(await this.http.get('/api/horarios?' + query, options));
  }
  async reservar(servicioId: string, fecha: string, hora: string, importe: string, empleadoId?: string): Promise<ReservaCreada> {
    const total = Number(decimal(importe, 'total'));
    if (!Number.isFinite(total) || total < 0) throw new Error('Importe de reserva inválido.');
    const result = await this.http.request('/api/citas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ servicio_id: apiId(servicioId), fecha: day(fecha), hora: hour(hora), metodo_pago: 'TRANSFERENCIA', total, ...(empleadoId ? { empleado_id: apiId(empleadoId) } : {}) }) });
    const dto = record(result.body, 'reserva');
    if (result.status !== 201 || dto.success !== true) throw new Error('El servidor no confirmó la cita.');
    const cita = record(dto.cita, 'reserva.cita');
    if (cita.estado !== 'PENDIENTE') throw new Error('El servidor devolvió un estado inesperado para la cita por transferencia.');
    return { id: identifier(cita.id, 'reserva.cita.id'), estado: 'PENDIENTE' };
  }
  async cancelar(id: string) {
    const result = await this.http.request('/api/citas', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: apiId(id) }) });
    confirmarOk(result.body);
  }
}
