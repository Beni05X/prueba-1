import { record, list, identifier, text, decimal } from '@/shared/adapters/validation';
import { instant, hour } from '@/shared/adapters/account-validation';
import { formatPrice } from '@/utils/format-price';
import type { Recordatorio } from '../models/notificacion';
export function recordatoriosResponse(value: unknown): readonly Recordatorio[] {
  const dto = record(value, 'recordatorios');
  const citas = list(dto.citasProximas, 'citasProximas').map((value) => {
    const item = record(value, 'recordatorio.cita');
    return { id: 'cita-' + identifier(item.id, 'cita.id'), titulo: text(item.servicio, 'cita.servicio'), detalle: new Date(instant(item.fecha, 'cita.fecha')).toLocaleDateString('es-MX') + ' · ' + hour(item.hora) + ' · ' + text(item.estado, 'cita.estado'), href: '/agenda' as const };
  });
  const pedidos = list(dto.pedidosEnTransito, 'pedidosEnTransito').map((value) => {
    const item = record(value, 'recordatorio.pedido'); const id = identifier(item.id, 'pedido.id');
    return { id: 'pedido-' + id, titulo: 'Pedido #' + id, detalle: text(item.productos, 'pedido.productos') + ' · ' + text(item.estado, 'pedido.estado') + ' · ' + formatPrice(decimal(item.total, 'pedido.total')), href: '/cuenta/compras' as const };
  });
  return [...citas, ...pedidos];
}
