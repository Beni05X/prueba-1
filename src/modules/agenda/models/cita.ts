export const SECCIONES_AGENDA = ['Próximas', 'Historial'] as const;
export type SeccionAgenda = (typeof SECCIONES_AGENDA)[number];
export type EstadoCita = string;
export type Cita = Readonly<{ id: string; servicioNombre: string; fecha: string; hora: string; duracion: string; estado: EstadoCita; empleado: string | null; notas: string | null }>;
export type Horario = Readonly<{ id: string; hora: string; disponible: boolean }>;
export type Disponibilidad = Readonly<{ sinAtencion: boolean; horarios: readonly Horario[] }>;
export type ReservaCreada = Readonly<{ id: string; estado: 'PENDIENTE' }>;
