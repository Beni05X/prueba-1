import { AdapterError } from '@/shared/adapters/adapter-error';
import { identifier, list, nullableText, numericDecimal, record, text } from '@/shared/adapters/validation';
import type { Servicio } from '../models/servicio';

export function adaptServicioDto(value: unknown, path = 'servicio'): Servicio {
  const dto = record(value, path);
  const id = identifier(dto.id, `${path}.id`);
  const nombre = text(dto.nombre, `${path}.nombre`);
  const imagen = dto.imagen === null ? null : nullableText(dto.imagen, `${path}.imagen`);
  const duracionTexto = text(dto.duracion, `${path}.duracion`);
  const precio = numericDecimal(dto.precio_min, `${path}.precio_min`);
  if (typeof dto.disponible !== 'boolean') throw new AdapterError(`${path}.disponible`, 'un booleano');
  const categoria = text(dto.categoria, `${path}.categoria`);
  return { id, nombre, precio, duracionTexto, imagen, categoria, disponible: dto.disponible };
}

export function adaptServiciosRespuesta(value: unknown): readonly Servicio[] {
  const response = record(value, 'respuesta');
  return list(response.servicios, 'respuesta.servicios').map((item, index) => adaptServicioDto(item, `respuesta.servicios[${index}]`));
}

export function adaptServicioDetalle(value: unknown, path = 'servicio'): Servicio {
  const dto = record(value, path);
  const id = identifier(dto.id, `${path}.id`);
  const nombre = text(dto.nombre, `${path}.nombre`);
  const imagen = dto.imagen === null ? null : nullableText(dto.imagen, `${path}.imagen`);
  const duracionTexto = text(dto.duracion, `${path}.duracion`);
  const precio = numericDecimal(dto.precio, `${path}.precio`);
  return { id, nombre, precio, duracionTexto, imagen };
}
