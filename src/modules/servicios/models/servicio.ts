import type { JsonValue } from '@/shared/models/json-value';
export type Servicio = Readonly<{
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number | string;
  duracionMinutos?: number;
  duracionTexto?: string;
  incluye?: readonly string[];
  imagen?: JsonValue;
  categoria?: string;
  disponible?: boolean;
}>;
