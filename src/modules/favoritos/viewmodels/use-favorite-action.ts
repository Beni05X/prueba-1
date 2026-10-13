import { useCallback } from 'react';
import { router } from 'expo-router';
import type { CategoriaCatalogo } from '@/modules/catalogo/models/catalogo';
import { HttpFavoritosService } from '../services/favoritos-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
const service = new HttpFavoritosService();
export function useFavoriteAction(categoria: CategoriaCatalogo, id?: string) {
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar(categoria, { signal }), [categoria]));
  const selected = !!vm.datos?.some((item) => item.id === id);
  return { ...vm, label: selected ? 'Quitar de favoritos' : 'Agregar a favoritos',
    toggle: () => { if (!vm.authenticated) { router.push({ pathname: '/autenticacion', params: { returnTo: id ? categoria === 'Productos' ? '/productos/' + id : (categoria === 'Cursos' ? '/cursos?id=' : '/servicios?id=') + id : '/perfil' } }); return; }
      if (id) void vm.ejecutar(() => service.toggle(categoria, id), (accion) => accion === 'agregado' ? 'Favorito agregado.' : 'Favorito eliminado.'); } };
}
