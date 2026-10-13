export type Curso = Readonly<{
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number | string;
  instructor?: string;
  duracionHoras?: number | null;
  modalidad?: string;
  inicioTexto?: string;
  fechaInicio?: string | null;
  fechaFin?: string | null;
  nivel?: string | null;
  imagen?: import('@/shared/models/json-value').JsonValue;
  cupoMaximo?: number | null;
  inscritos?: number | null;
}>;
