import type { EstadoModulo } from '@/shared/models/view-state';
import type { Recordatorio } from '../models/notificacion';
export type EstadoNotificaciones = EstadoModulo<readonly Recordatorio[]>;
