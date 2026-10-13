import type { EstadoModulo } from '@/shared/models/view-state';
import type { Compra } from '../models/venta';

export type EstadoCompras = EstadoModulo<readonly Compra[]>;
