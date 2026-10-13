import { useMemo, useState } from 'react';
import type { Servicio } from '@/modules/servicios/models/servicio';
import { HttpServiciosService, type ServiciosService } from '@/modules/servicios/services/servicios-service';
import { LoadState } from '@/shared/viewmodels/load-state';
import { useLoadState } from '@/shared/viewmodels/use-load-state';
import { formatPrice } from '@/utils/format-price';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { usePerfilViewModel } from '@/modules/perfil/viewmodels/use-perfil-view-model';
import { useAgendaViewModel } from '@/modules/agenda/viewmodels/use-agenda-view-model';
import { perfilSession } from '@/modules/perfil/adapters/perfil-adapter';

const defaultService = new HttpServiciosService();
const categories = [
  { title: 'Servicios', icon: 'service' as const, href: { pathname: '/catalogo' as const, params: { categoria: 'Servicios' } } },
  { title: 'Cursos', icon: 'course' as const, href: { pathname: '/catalogo' as const, params: { categoria: 'Cursos' } } },
  { title: 'Productos', icon: 'product' as const, href: '/catalogo?categoria=Productos' as const },
] as const;
class InicioViewModel extends LoadState<readonly Servicio[]> {
  constructor(private readonly service: ServiciosService) { super([], 'cargando'); }
  cargar = (signal?: AbortSignal) => this.load(() => this.service.listar({ signal }));
}
export function useInicioViewModel(service: ServiciosService = defaultService) {
  const { session } = useAuthSession();
  const profile = usePerfilViewModel();
  const agenda = useAgendaViewModel();
  const nombre = profile.perfil?.nombre ?? (session ? perfilSession(session).nombre : '');
  const proximaCita = [...agenda.citas].sort((a, b) => Date.parse(a.fecha) - Date.parse(b.fecha))[0] ?? null;
  const vm = useMemo(() => new InicioViewModel(service), [service]);
  const { estado } = useLoadState(vm);
  const [busqueda, setBusqueda] = useState('');
  const normalizedSearch = normalize(busqueda);
  const matchingServices = normalizedSearch ? estado.datos.filter((item) => normalize([item.nombre, item.categoria].filter(Boolean).join(' ')).includes(normalizedSearch)) : estado.datos.slice(0, 2);
  return {
    saludo: nombre ? `Hola, ${nombre}` : 'Hola',
    proximaCita, errorAgenda: agenda.error, recargarAgenda: agenda.recargar, cargandoAgenda: agenda.cargando,
    autenticado: !!session,
    categorias: categories,
    destacados: matchingServices.map((item) => ({ id: item.id, title: item.nombre, price: `Desde ${formatPrice(item.precio)}`, image: item.imagen, href: { pathname: '/servicios' as const, params: { id: item.id } } })),
    busqueda, cambiarBusqueda: setBusqueda,
    cargando: estado.estadoCarga === 'cargando', error: estado.error,
    vacio: estado.estadoCarga === 'listo' && estado.datos.length === 0,
    sinResultados: !!normalizedSearch && matchingServices.length === 0,
    recargar: () => vm.cargar(),
  };
}

function normalize(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim(); }
