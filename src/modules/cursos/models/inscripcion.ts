export type MiCurso = Readonly<{ id: string; cursoId: string | null; nombre: string | null; estado: string; fecha: string; precio: string | null; totalPagado: string; diasAsistidos: number; pagos: readonly { id: string; monto: string; estado: string }[] }>;
export type InscripcionCreada = Readonly<{ inscripcionId: string; pagoId: string; monto: string }>;
