import type { JsonValue } from '@/shared/models/json-value';
/** Prisma Json is not constrained to images or URL arrays by this API. */
export type JsonDto = JsonValue;

export type VarianteProductoDto = Readonly<{
  id: number;
  tono: string | null;
  presentacion: string | null;
  precio_venta: number;
  stock: number;
  imagen: JsonDto;
}>;

export type ProductoDto = Readonly<{
  id: number;
  nombre: string;
  descripcion: string | null;
  marca: Readonly<{ nombre: string }> | null;
  categoria: Readonly<{ nombre: string }> | null;
  imagen: JsonDto;
  variantes: readonly VarianteProductoDto[];
  // Math.min([]) is Infinity in the backend and becomes null in JSON.
  precio_min: number | null;
  en_stock: boolean;
}>;

export type ProductosRespuestaDto = readonly ProductoDto[];
