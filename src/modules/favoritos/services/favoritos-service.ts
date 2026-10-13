import { fetchHttpClient, type HttpMutationClient, type RequestOptions } from '@/services/api';
import { confirmarOk } from '@/modules/auth/adapters/auth-adapter';
import { apiId } from '@/shared/adapters/account-validation';
import { favoritosResponse, favoritoToggleResponse } from '../adapters/favoritos-adapter';
import type { CategoriaCatalogo } from '@/modules/catalogo/models/catalogo';
import type { Favorito } from '../models/favorito';
const paths: Record<CategoriaCatalogo, string> = { Productos: '/api/favoritos', Servicios: '/api/favoritos-servicios', Cursos: '/api/favoritos-cursos' };
export class HttpFavoritosService {
  constructor(private readonly http: HttpMutationClient = fetchHttpClient) {}
  async listar(categoria: CategoriaCatalogo, options?: RequestOptions) { return favoritosResponse(await this.http.get(paths[categoria], options), categoria); }
  async toggle(categoria: CategoriaCatalogo, id: string) {
    const body = categoria === 'Cursos' ? { cursoId: apiId(id) } : categoria === 'Servicios' ? { servicio_id: apiId(id) } : { producto_id: apiId(id) };
    return favoritoToggleResponse((await this.http.request(paths[categoria], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).body, categoria);
  }
  async quitar(item: Favorito) {
    if (item.categoria === 'Cursos') return this.toggle(item.categoria, item.id);
    const result = await this.http.request(paths[item.categoria] + '?id=' + apiId(item.favoritoId!), { method: 'DELETE' });
    confirmarOk(result.body); return 'eliminado';
  }
}
