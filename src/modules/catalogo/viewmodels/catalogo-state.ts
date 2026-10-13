import type { Href } from 'expo-router';

import type { EstadoModulo } from '@/shared/models/view-state';
import type { CategoriaCatalogo, DatosCatalogo } from '../models/catalogo';
import type { JsonValue } from '@/shared/models/json-value';

export type EstadoCatalogo = EstadoModulo<DatosCatalogo> & Readonly<{
  categoriaSeleccionada: CategoriaCatalogo;
  busqueda: string;
}>;

export type TarjetaCatalogo = Readonly<{
  id: string;
  title: string;
  description?: string;
  price: string;
  kind: 'service' | 'course';
  href?: Href;
  image?: JsonValue;
}>;
