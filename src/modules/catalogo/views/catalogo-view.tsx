import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { CatalogCard, ChoiceChips, SearchField, SectionHeading, SegmentedControl } from '@/components/ui/style-guide';
import { ProductosListView } from '@/modules/productos/views/productos-list-view';
import { Spacing } from '@/theme';
import { useCatalogoViewModel } from '@/modules/catalogo/viewmodels/use-catalogo-view-model';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/async-states';

export default function CatalogScreen() {
  const { categoria, q } = useLocalSearchParams<{ categoria?: string; q?: string }>();
  return <CatalogContent key={`${categoria ?? 'Servicios'}-${q ?? ''}`} categoriaInicial={categoria} busquedaInicial={q} />;
}

function CatalogContent({ categoriaInicial, busquedaInicial }: { categoriaInicial?: string; busquedaInicial?: string }) {
  const { categorias, categoriaSeleccionada, seleccionarCategoria, busqueda, cambiarBusqueda, tarjetas, productosFiltrados, cargando, error, vacio, recargar, filtrosProducto, filtroProducto, seleccionarFiltroProducto, ordenesProducto, ordenProducto, seleccionarOrdenProducto, filtrosServicio, filtroServicio, seleccionarFiltroServicio, filtrosCurso, filtroCurso, seleccionarFiltroCurso } = useCatalogoViewModel(categoriaInicial, busquedaInicial);

  return (
    <Screen title="Catálogo">
      <SearchField placeholder="Buscar en esta categoría…" value={busqueda} onChangeText={cambiarBusqueda} />
      <SegmentedControl options={categorias} selected={categoriaSeleccionada} onSelect={seleccionarCategoria} />
      <View style={styles.section}>
        <SectionHeading title={categoriaSeleccionada} />
        {categoriaSeleccionada === 'Servicios' ? <ChoiceChips options={filtrosServicio.map((value) => ({ value, label: value }))} selected={filtroServicio} onSelect={seleccionarFiltroServicio} /> : null}
        {categoriaSeleccionada === 'Cursos' ? <ChoiceChips options={filtrosCurso.map((value) => ({ value, label: value }))} selected={filtroCurso} onSelect={seleccionarFiltroCurso} /> : null}
        {categoriaSeleccionada === 'Productos' ? <ChoiceChips options={filtrosProducto.map((value) => ({ value, label: value }))} selected={filtroProducto} onSelect={seleccionarFiltroProducto} /> : null}
        {categoriaSeleccionada === 'Productos' ? <ChoiceChips options={ordenesProducto.map((value) => ({ value, label: value }))} selected={ordenProducto} onSelect={seleccionarOrdenProducto} /> : null}
        {cargando ? <LoadingState label="Cargando catálogo…" /> : null}
        {!cargando && error ? <ErrorState message={error} onRetry={recargar} /> : null}
        {!cargando && !error && vacio ? <EmptyState title="No encontramos resultados" description={busqueda ? 'Prueba otra búsqueda.' : 'No hay elementos disponibles en esta categoría.'} /> : null}
        {!cargando && !error && (categoriaSeleccionada === 'Productos'
          ? <ProductosListView productos={productosFiltrados} resetKey={JSON.stringify([busqueda, filtroProducto, ordenProducto])} />
          : tarjetas.map(({ id, ...card }) => <CatalogCard key={id} {...card} />))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ section: { gap: Spacing.three } });
