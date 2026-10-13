import type { EstadoModulo } from '@/shared/models/view-state';
import type { Servicio } from '../models/servicio';

export type EstadoServicios = EstadoModulo<Servicio | null>;
