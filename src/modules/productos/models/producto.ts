import type { JsonValue } from '@/shared/models/json-value';

export type VarianteProducto = Readonly<{
  id: string;
  tono: string | null;
  presentacion: string | null;
  precio: number;
  stock: number;
  imagen: JsonValue;
}>;

export type Producto = Readonly<{
  id: string;
  nombre: string;
  descripcion?: string | null;
  precio: number | string | null;
  marca: string | null;
  categoria: string | null;
  imagen: JsonValue;
  variantes: readonly VarianteProducto[];
  enStock: boolean;
}>;
