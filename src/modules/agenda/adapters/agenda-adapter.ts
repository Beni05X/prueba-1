import { record, list, identifier, text, nullableText } from '@/shared/adapters/validation';
import { AdapterError } from '@/shared/adapters/adapter-error';
import { instant, hour } from '@/shared/adapters/account-validation';
import type { Cita, Disponibilidad } from '../models/cita';
import { calendarDayFromApi } from '@/shared/viewmodels/calendar';
export function citasResponse(value: unknown): readonly Cita[] {
  return list(value, 'citas').map((item) => {
    const dto = record(item, 'cita'); const servicio = record(dto.servicio, 'cita.servicio');
    return { id: identifier(dto.id, 'cita.id'), servicioNombre: text(servicio.nombre, 'cita.servicio.nombre'),
      fecha: instant(dto.fecha, 'cita.fecha'), hora: hour(dto.hora), duracion: text(servicio.duracion, 'cita.servicio.duracion'),
      estado: text(dto.estado, 'cita.estado'), empleado: dto.empleado == null ? null : text(record(dto.empleado, 'cita.empleado').nombre, 'cita.empleado.nombre'),
      notas: dto.notas == null ? null : nullableText(dto.notas, 'cita.notas') };
  });
}
export function horariosResponse(value: unknown): Disponibilidad {
  const dto = record(value, 'horarios');
  if (typeof dto.sinAtencion !== 'boolean') throw new AdapterError('horarios.sinAtencion', 'booleano');
  const horarios = list(dto.horarios, 'horarios.horarios').map((item) => {
    const row = record(item, 'horario');
    if (typeof row.disponible !== 'boolean') throw new AdapterError('horario.disponible', 'booleano');
    return { id: identifier(row.id, 'horario.id'), hora: hour(row.hora), disponible: row.disponible };
  });
  return { sinAtencion: dto.sinAtencion, horarios };
}
export function diasBloqueadosResponse(value: unknown): readonly string[] {
  return list(value, 'días bloqueados').map((item) => calendarDayFromApi(record(item, 'día bloqueado').fecha));
}
