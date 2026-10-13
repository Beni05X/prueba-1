export type ServicioDto = Readonly<{
  id: number;
  nombre: string;
  imagen: string | null;
  duracion: string;
  precio_min: number;
  disponible: boolean;
  categoria: string;
}>;

export type ServiciosRespuestaDto = Readonly<{ servicios: readonly ServicioDto[] }>;

/** GET /api/servicios/:id uses precio and has no response wrapper. */
export type ServicioDetalleDto = Readonly<{
  id: number;
  nombre: string;
  imagen: string | null;
  duracion: string;
  precio: number;
}>;
