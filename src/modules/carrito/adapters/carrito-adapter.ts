import { record, list, identifier, text, nullableText, decimal } from '@/shared/adapters/validation';
import { integer, cents, money } from '@/shared/adapters/account-validation';
import type { DatosCarrito } from '../models/carrito';
export function carritoResponse(value: unknown): DatosCarrito {
  const items = list(value, 'carrito').map((item, i) => {
    const dto = record(item, 'carrito.' + i);
    const producto = record(dto.producto, 'carrito.producto');
    return { id: identifier(dto.id, 'carrito.id'), varianteId: identifier(dto.variante_id, 'carrito.variante_id'),
      titulo: text(producto.nombre, 'carrito.producto.nombre'), variante: [nullableText(dto.tono, 'carrito.tono'), nullableText(dto.presentacion, 'carrito.presentacion')].filter(Boolean).join(' · '),
      precio: decimal(dto.precio_venta, 'carrito.precio_venta'), cantidad: integer(dto.cantidad, 'carrito.cantidad'), stock: integer(dto.stock, 'carrito.stock') };
  });
  const subtotal = items.reduce((sum, item) => sum + cents(item.precio) * BigInt(item.cantidad), 0n);
  // Shipping rules confirmed in POST /api/pedidos. No fictitious discount.
  const envio = items.length && subtotal < 150000n ? 10000n : 0n;
  return { items, resumen: { subtotal: money(subtotal), envio: money(envio), total: money(subtotal + envio) } };
}
