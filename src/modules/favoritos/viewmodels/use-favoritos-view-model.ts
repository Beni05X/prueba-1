import { useCallback, useState } from 'react';
import { CATEGORIAS_CATALOGO, type CategoriaCatalogo } from '@/modules/catalogo/models/catalogo';
import { HttpFavoritosService } from '../services/favoritos-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import type { Favorito } from '../models/favorito';
const service = new HttpFavoritosService();
export function useFavoritosViewModel() {
  const [categoria, setCategoria] = useState<CategoriaCatalogo>('Servicios');
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar(categoria, { signal }), [categoria]));
  return { ...vm, categorias: CATEGORIAS_CATALOGO, favoriteCategory: categoria,
    setFavoriteCategory: (value: string) => { const category = CATEGORIAS_CATALOGO.find((item) => item === value); if (category) setCategoria(category); },
    favoritos: vm.datos ?? [], quitar: (item: Favorito) => vm.ejecutar(() => service.quitar(item), 'Favoritos actualizados.') };
}
