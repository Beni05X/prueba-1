import { record, list, identifier, text, decimal, numericDecimal } from '@/shared/adapters/validation';
import type { CategoriaCatalogo } from '@/modules/catalogo/models/catalogo';
import type { Favorito } from '../models/favorito';
export function favoritosResponse(value: unknown, categoria: CategoriaCatalogo): readonly Favorito[] {
  if (categoria === 'Cursos') return list(record(value, 'favoritos-cursos').cursos, 'favoritos-cursos.cursos').map((item) => {
    const dto = record(item, 'favorito.curso'); return { id: identifier(dto.id, 'curso.id'), favoritoId: null, nombre: text(dto.titulo, 'curso.titulo'), precio: decimal(dto.precio_total, 'curso.precio_total'), categoria };
  });
  return list(value, 'favoritos').map((item) => {
    const row = record(item, 'favorito'); const dto = record(categoria === 'Productos' ? row.producto : row.servicio, 'favorito.detalle');
    return { id: identifier(dto.id, 'favorito.detalle.id'), favoritoId: identifier(row.id, 'favorito.id'), nombre: text(dto.nombre, 'favorito.nombre'), precio: dto.precio_min === null ? null : categoria === 'Servicios' ? numericDecimal(dto.precio_min, 'favorito.precio') : decimal(dto.precio_min, 'favorito.precio'), categoria };
  });
}
export function favoritoToggleResponse(value: unknown, categoria: CategoriaCatalogo): string {
  const dto = record(value, 'favorito.toggle');
  if ((categoria !== 'Cursos' && dto.ok !== true) || !['agregado', categoria === 'Cursos' ? 'quitado' : 'eliminado'].includes(String(dto.accion))) throw new Error('El servidor no confirmó el cambio de favorito.');
  if (categoria === 'Cursos') identifier(dto.cursoId, 'favorito.cursoId');
  return String(dto.accion);
}
