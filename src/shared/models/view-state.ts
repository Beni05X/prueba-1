export type EstadoCarga = 'listo' | 'cargando' | 'error';

export type EstadoModulo<T> = Readonly<{
  datos: T;
  estadoCarga: EstadoCarga;
  error: string | null;
}>;

