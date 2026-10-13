import { View } from 'react-native';
import { Button } from '@/components/ui/button';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { CatalogCard, SegmentedControl } from '@/components/ui/style-guide';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useFavoritosViewModel } from '../viewmodels/use-favoritos-view-model';
import { formatPrice } from '@/utils/format-price';
export function FavoritosView() {
  const vm = useFavoritosViewModel();
  return <><SegmentedControl options={vm.categorias} selected={vm.favoriteCategory} onSelect={vm.setFavoriteCategory} />
    <ResourceStatus {...vm} empty={!vm.favoritos.length} emptyTitle="No tienes favoritos en esta categoría" />
    <View style={styles.section}>{vm.favoritos.map((item) => <View key={item.id}>
      <CatalogCard title={item.nombre} price={item.precio === null ? 'Sin precio publicado' : formatPrice(item.precio)} kind={item.categoria === 'Productos' ? 'product' : item.categoria === 'Cursos' ? 'course' : 'service'} href={item.categoria === 'Productos' ? { pathname: '/productos/[id]', params: { id: item.id } } : { pathname: item.categoria === 'Cursos' ? '/cursos' : '/servicios', params: { id: item.id } }} />
      <Button label="Quitar favorito" variant="secondary" disabled={vm.ocupado} onPress={() => { void vm.quitar(item); }} />
    </View>)}</View>
  </>;
}
