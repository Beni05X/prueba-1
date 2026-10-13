import type { Curso } from '@/modules/cursos/models/curso';
import type { Producto } from '@/modules/productos/models/producto';
import type { Servicio } from '@/modules/servicios/models/servicio';

export const CATEGORIAS_CATALOGO = ['Servicios', 'Cursos', 'Productos'] as const;

export type CategoriaCatalogo = (typeof CATEGORIAS_CATALOGO)[number];

export type DatosCatalogo = Readonly<{
  Servicios: readonly Servicio[];
  Cursos: readonly Curso[];
  Productos: readonly Producto[];
}>;
