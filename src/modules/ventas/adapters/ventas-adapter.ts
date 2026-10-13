import { record, list, identifier, text, nullableText, decimal } from '@/shared/adapters/validation';
import { instant, integer } from '@/shared/adapters/account-validation';
import type { Compra } from '../models/venta';
export function comprasResponse(value: unknown): readonly Compra[] {
  return list(value, 'compras').map((item) => {
    const dto = record(item, 'compra');
    return { id: identifier(dto.id, 'compra.id'), estado: text(dto.estado, 'compra.estado'), fecha: instant(dto.fecha_pedido, 'compra.fecha_pedido'),
      subtotal: decimal(dto.subtotal, 'compra.subtotal'), envio: decimal(dto.costo_envio, 'compra.costo_envio'), total: decimal(dto.total, 'compra.total'),
      metodoPago: nullableText(dto.metodo_pago, 'compra.metodo_pago'), detalles: list(dto.detalles, 'compra.detalles').map((item) => {
        const row = record(item, 'detalle'); return { id: identifier(row.id, 'detalle.id'), nombre: text(row.nombre_producto, 'detalle.nombre_producto'),
          variante: nullableText(row.descripcion_variante, 'detalle.descripcion_variante'), cantidad: integer(row.cantidad, 'detalle.cantidad', 1), subtotal: decimal(row.subtotal, 'detalle.subtotal') };
      }) };
  });
}
export function pedidoResponse(value: unknown) {
  const dto = record(value, 'pedido');
  if (dto.ok !== true) throw new Error('El servidor no confirmó el pedido.');
  return { id: identifier(dto.pedido_id, 'pedido_id'), total: decimal(dto.total, 'pedido.total'), metodoPago: text(dto.metodo_pago, 'pedido.metodo_pago') };
}
