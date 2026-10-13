import type { Producto } from '../models/producto';
import { cents } from '@/shared/adapters/account-validation';

export const ORDEN_PRODUCTOS = ['Publicación', 'Nombre A–Z', 'Precio menor', 'Precio mayor'] as const;
export type OrdenProductos = (typeof ORDEN_PRODUCTOS)[number];
export function sortProductos(productos: readonly Producto[], orden: string): readonly Producto[] {
  if (orden === 'Publicación') return productos;
  return [...productos].sort((a, b) => {
    if (orden === 'Nombre A–Z') return a.nombre.localeCompare(b.nombre, 'es');
    if (a.precio == null) return b.precio == null ? 0 : 1;
    if (b.precio == null) return -1;
    const left = cents(a.precio), right = cents(b.precio);
    const comparison = left < right ? -1 : left > right ? 1 : 0;
    return orden === 'Precio mayor' ? -comparison : comparison;
  });
}

function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase(); }

export function filterProductos(productos: readonly Producto[], query: string, facet: string): readonly Producto[] {
  const needle = normalize(query.trim());
  return productos.filter((product) => {
    const searchable = [product.nombre, product.descripcion, product.marca, product.categoria, ...product.variantes.flatMap((variant) => [variant.tono, variant.presentacion])];
    const matchesText = !needle || searchable.some((value) => value != null && normalize(value).includes(needle));
    const matchesFacet = facet === 'Todos' || (facet === 'Con existencias' ? product.enStock : facet === `Categoría: ${product.categoria}`);
    return matchesText && matchesFacet;
  });
}

export function opcionesFiltroProductos(productos: readonly Producto[]): readonly string[] {
  return ['Todos', ...new Set(productos.map((product) => product.categoria).filter((category): category is string => !!category).map((category) => `Categoría: ${category}`)), ...(productos.some((product) => product.enStock) ? ['Con existencias'] : [])];
}
