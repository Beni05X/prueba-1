import { AdapterError } from '@/shared/adapters/adapter-error';
import { decimal, finiteNumber, identifier, list, nullableText, record, text } from '@/shared/adapters/validation';
import type { Producto } from '../models/producto';

function jsonValue(value: unknown, path: string): import('./producto-dto').JsonDto {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    finiteNumber(value, path);
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => jsonValue(item, `${path}[${index}]`));
  }
  const object = record(value, path);
  return Object.fromEntries(Object.entries(object).map(([key, item]) => [key, jsonValue(item, `${path}.${key}`)]));
}

function namedRelation(value: unknown, path: string): string | null {
  if (value === null) return null;
  return text(record(value, path).nombre, `${path}.nombre`);
}

export function adaptProductoDto(value: unknown, path = 'producto'): Producto {
  const dto = record(value, path);
  const id = identifier(dto.id, `${path}.id`);
  const nombre = text(dto.nombre, `${path}.nombre`);
  const descripcion = nullableText(dto.descripcion, `${path}.descripcion`);
  const marca = namedRelation(dto.marca, `${path}.marca`);
  const categoria = namedRelation(dto.categoria, `${path}.categoria`);
  const imagen = jsonValue(dto.imagen, `${path}.imagen`);
  const variantes = list(dto.variantes, `${path}.variantes`);
  const modelosVariantes = variantes.map((value, index) => {
    const variantPath = `${path}.variantes[${index}]`;
    const variante = record(value, variantPath);
    const id = identifier(variante.id, `${variantPath}.id`);
    const tono = nullableText(variante.tono, `${variantPath}.tono`);
    const presentacion = nullableText(variante.presentacion, `${variantPath}.presentacion`);
    const precio = decimal(finiteNumber(variante.precio_venta, `${variantPath}.precio_venta`), `${variantPath}.precio_venta`);
    const stock = finiteNumber(variante.stock, `${variantPath}.stock`);
    if (!Number.isSafeInteger(stock)) throw new AdapterError(`${variantPath}.stock`, 'un entero seguro');
    const imagenVariante = jsonValue(variante.imagen, `${variantPath}.imagen`);
    return { id, tono, presentacion, precio: Number(precio), stock, imagen: imagenVariante };
  });
  if (typeof dto.en_stock !== 'boolean') throw new AdapterError(`${path}.en_stock`, 'un booleano');
  if (dto.precio_min === null && variantes.length > 0) {
    throw new AdapterError(`${path}.precio_min`, 'un importe cuando existen variantes');
  }
  const precio = dto.precio_min === null ? null : decimal(finiteNumber(dto.precio_min, `${path}.precio_min`), `${path}.precio_min`);
  return { id, nombre, descripcion, precio, marca, categoria, imagen, variantes: modelosVariantes, enStock: dto.en_stock };
}

export function adaptProductosRespuesta(value: unknown): readonly Producto[] {
  return list(value, 'respuesta').map((item, index) => adaptProductoDto(item, `respuesta[${index}]`));
}
