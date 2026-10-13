import type { EstadoModulo } from '@/shared/models/view-state';
import type { Producto } from '../models/producto';

export type EstadoProductos = EstadoModulo<readonly Producto[]>;
