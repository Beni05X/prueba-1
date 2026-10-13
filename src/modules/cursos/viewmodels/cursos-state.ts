import type { EstadoModulo } from '@/shared/models/view-state';
import type { Curso } from '../models/curso';

export type EstadoCursos = EstadoModulo<Curso | null>;
