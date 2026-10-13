import type { MiCurso } from '../models/inscripcion';
import type { EstadoModulo } from '@/shared/models/view-state';

export type EstadoMisCursos = EstadoModulo<readonly MiCurso[]>;
