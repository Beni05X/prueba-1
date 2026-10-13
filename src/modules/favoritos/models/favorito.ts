import type { CategoriaCatalogo } from '@/modules/catalogo/models/catalogo';
export type Favorito = Readonly<{ id: string; favoritoId: string | null; nombre: string; precio: string | null; categoria: CategoriaCatalogo }>;
