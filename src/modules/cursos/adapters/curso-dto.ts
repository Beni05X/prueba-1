/** Consumed projection of GET /api/cursos; Prisma Decimal is serialized as text. */
export type CursoDto = Readonly<{
  id: number;
  titulo: string;
  descripcion: string | null;
  precio_total: string;
  duracion_horas: number | null;
  nivel: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}>;

export type CursosRespuestaDto = Readonly<{ cursos: readonly CursoDto[] }>;
