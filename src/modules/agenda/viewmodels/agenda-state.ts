import type { EstadoModulo } from '@/shared/models/view-state';
import type { SeccionAgenda, Cita } from '../models/cita';

export type EstadoAgenda = EstadoModulo<readonly Cita[]> & Readonly<{
  seccionSeleccionada: SeccionAgenda;
}>;
