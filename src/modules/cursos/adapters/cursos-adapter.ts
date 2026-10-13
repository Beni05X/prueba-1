import { AdapterError } from '@/shared/adapters/adapter-error';
import { calendarDate, decimal, finiteNumber, identifier, list, nullableText, record, text } from '@/shared/adapters/validation';
import type { Curso } from '../models/curso';
import type { CursoDto } from './curso-dto';
import { integer } from '@/shared/adapters/account-validation';
import { imageUri } from '@/shared/viewmodels/media-state';
import type { JsonValue } from '@/shared/models/json-value';

export function adaptCursoDto(value: unknown, path = 'curso'): Curso {
  const dto = record(value, path);
  const id = identifier(dto.id, `${path}.id`);
  const duration = dto.duracion_horas === null ? null : finiteNumber(dto.duracion_horas, `${path}.duracion_horas`);
  if (duration !== null && !Number.isSafeInteger(duration)) {
    throw new AdapterError(`${path}.duracion_horas`, 'un entero seguro o null');
  }
  const checked: CursoDto = {
    id: Number(id),
    titulo: text(dto.titulo, `${path}.titulo`),
    descripcion: nullableText(dto.descripcion, `${path}.descripcion`),
    precio_total: decimal(text(dto.precio_total, `${path}.precio_total`), `${path}.precio_total`),
    duracion_horas: duration,
    nivel: nullableText(dto.nivel, `${path}.nivel`),
    fecha_inicio: calendarDate(dto.fecha_inicio, `${path}.fecha_inicio`),
    fecha_fin: calendarDate(dto.fecha_fin, `${path}.fecha_fin`),
  };
  return {
    id,
    nombre: checked.titulo,
    descripcion: checked.descripcion,
    precio: checked.precio_total,
    duracionHoras: checked.duracion_horas,
    nivel: checked.nivel,
    fechaInicio: checked.fecha_inicio,
    fechaFin: checked.fecha_fin,
    imagen: dto.imagenes == null ? null : imageUri(dto.imagenes as JsonValue) ?? null,
    cupoMaximo: dto.cupo_maximo == null ? null : integer(dto.cupo_maximo, `${path}.cupo_maximo`),
    inscritos: dto.inscritos == null ? null : integer(dto.inscritos, `${path}.inscritos`),
  };
}

export function adaptCursosRespuesta(value: unknown): readonly Curso[] {
  const response = record(value, 'respuesta');
  return list(response.cursos, 'respuesta.cursos').map((item, index) => adaptCursoDto(item, `respuesta.cursos[${index}]`));
}
