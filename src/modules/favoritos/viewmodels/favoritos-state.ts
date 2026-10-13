import type { EstadoModulo } from '@/shared/models/view-state';
import type { Favorito } from '../models/favorito';
export type EstadoFavoritos = EstadoModulo<readonly Favorito[]>;
