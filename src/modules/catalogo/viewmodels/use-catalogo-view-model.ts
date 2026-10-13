import { useMemo, useState } from 'react';

import { NavigationSections } from '@/constants/navigation';
import { CATEGORIAS_CATALOGO, type CategoriaCatalogo } from '@/modules/catalogo/models/catalogo';
import { type TarjetaCatalogo } from '@/modules/catalogo/viewmodels/catalogo-state';
import { ComposedCatalogoService, type CatalogoService } from '@/modules/catalogo/services/catalogo-service';
import { CatalogoViewModel } from './catalogo-view-model';
import type { Curso } from '@/modules/cursos/models/curso';
import type { Servicio } from '@/modules/servicios/models/servicio';
import { formatPrice } from '@/utils/format-price';
import { useLoadState } from '@/shared/viewmodels/use-load-state';
import { filterProductos, opcionesFiltroProductos, sortProductos, ORDEN_PRODUCTOS } from '@/modules/productos/viewmodels/product-filters';

const defaultService: CatalogoService = new ComposedCatalogoService();

function categoriaValida(value?: string): CategoriaCatalogo {
  return CATEGORIAS_CATALOGO.find((category) => category === value) ?? 'Servicios';
}

function tarjeta(item: Curso | Servicio, kind: TarjetaCatalogo['kind']): TarjetaCatalogo {
  return {
    id: item.id,
    title: item.nombre,
    description: item.descripcion ?? undefined,
    price: formatPrice(item.precio),
    kind,
    image: 'imagen' in item ? item.imagen : undefined,
    href: { pathname: kind === 'service' ? NavigationSections.services.href : NavigationSections.courses.href, params: { id: item.id } },
  };
}

export function useCatalogoViewModel(categoriaInicial?: string, busquedaInicial = '', service: CatalogoService = defaultService) {
  const viewModel = useMemo(() => new CatalogoViewModel(service), [service]);
  const { estado: datosEstado, tipoError } = useLoadState(viewModel);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(() => categoriaValida(categoriaInicial));
  const [busqueda, setBusqueda] = useState(busquedaInicial);
  const [filtroServicio, setFiltroServicio] = useState('Todas');
  const [filtroCurso, setFiltroCurso] = useState('Todos');
  const estado = { ...datosEstado, categoriaSeleccionada, busqueda };

  function seleccionarCategoria(value: string) {
    setCategoriaSeleccionada(categoriaValida(value));
  }

  function cambiarBusqueda(value: string) {
    setBusqueda(value);
  }

  const tarjetas: Record<Exclude<CategoriaCatalogo, 'Productos'>, readonly TarjetaCatalogo[]> = {
    Servicios: estado.datos.Servicios.filter((item) => coincide(busqueda, [item.nombre, item.descripcion, item.categoria]) && (filtroServicio === 'Todas' || item.categoria === filtroServicio)).map((item) => tarjeta(item, 'service')),
    Cursos: estado.datos.Cursos.filter((item) => coincide(busqueda, [item.nombre, item.descripcion, item.nivel]) && (filtroCurso === 'Todos' || item.nivel === filtroCurso)).map((item) => tarjeta(item, 'course')),
  };
  const productFilters = opcionesFiltroProductos(estado.datos.Productos);
  const serviceFilters = ['Todas', ...new Set(estado.datos.Servicios.map((item) => item.categoria).filter((value): value is string => !!value))];
  const courseFilters = ['Todos', ...new Set(estado.datos.Cursos.map((item) => item.nivel).filter((value): value is string => !!value))];
  const [filtroProducto, setFiltroProducto] = useState('Todos');
  const [ordenProducto, setOrdenProducto] = useState('Publicación');
  const filteredProductsByFacet = sortProductos(filterProductos(estado.datos.Productos, busqueda, filtroProducto), ordenProducto);

  return {
    estado,
    cargando: estado.estadoCarga === 'cargando',
    error: estado.error,
    tipoError,
    mensajeVacio: estado.estadoCarga === 'listo' ? 'No hay elementos disponibles en esta categoría.' : null,
    categorias: CATEGORIAS_CATALOGO,
    categoriaSeleccionada: estado.categoriaSeleccionada,
    seleccionarCategoria,
    busqueda: estado.busqueda,
    cambiarBusqueda,
    tarjetas: estado.categoriaSeleccionada === 'Productos' ? [] : tarjetas[estado.categoriaSeleccionada],
    productos: filteredProductsByFacet,
    recargar: () => viewModel.cargar(),
    vacio: estado.estadoCarga === 'listo' && (estado.categoriaSeleccionada === 'Productos' ? filteredProductsByFacet.length === 0 : tarjetas[estado.categoriaSeleccionada].length === 0),
    filtrosProducto: productFilters,
    filtroProducto,
    seleccionarFiltroProducto: setFiltroProducto,
    productosFiltrados: filteredProductsByFacet,
    ordenesProducto: ORDEN_PRODUCTOS,
    ordenProducto,
    seleccionarOrdenProducto: setOrdenProducto,
    filtrosServicio: serviceFilters,
    filtroServicio,
    seleccionarFiltroServicio: setFiltroServicio,
    filtrosCurso: courseFilters,
    filtroCurso,
    seleccionarFiltroCurso: setFiltroCurso,
  };
}

function coincide(query: string, values: readonly (string | null | undefined)[]) {
  const normalized = query.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
  return !normalized || values.some((value) => value?.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().includes(normalized));
}
