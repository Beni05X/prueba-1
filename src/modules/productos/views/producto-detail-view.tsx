import { Link, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Screen } from '@/components/ui/screen';
import { ChoiceChips, InfoRow, MediaPlaceholder } from '@/components/ui/style-guide';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/async-states';
import { ThemedText } from '@/components/themed-text';
import { formatPrice } from '@/utils/format-price';
import { useProductoViewModel } from '../viewmodels/use-producto-view-model';
import { Button } from '@/components/ui/button';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useCarritoProductoViewModel } from '../viewmodels/use-carrito-producto-view-model';
import { useFavoriteAction } from '@/modules/favoritos/viewmodels/use-favorite-action';

export default function ProductoDetailView() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { producto, selected, variantId, seleccionarVariante, cargando, error, recargar } = useProductoViewModel(id);
  const cart = useCarritoProductoViewModel(selected);
  const favorite = useFavoriteAction('Productos', id);
  return <Screen title="Producto" backHref="/catalogo">
    {cargando ? <LoadingState label="Cargando producto…" /> : null}
    {!cargando && error ? <ErrorState message={error} onRetry={recargar} /> : null}
    {!cargando && !error && !producto ? <EmptyState title="Producto no disponible" description="Vuelve al catálogo para explorar los productos." /> : null}
    {producto ? <>
      <MediaPlaceholder label={producto.nombre} source={selected?.imagen ?? producto.imagen} />
      <ThemedText type="title" accessibilityRole="header">{producto.nombre}</ThemedText>
      {producto.descripcion ? <ThemedText themeColor="textSecondary">{producto.descripcion}</ThemedText> : null}
      {producto.marca ? <InfoRow label="Marca" value={producto.marca} /> : null}
      {producto.categoria ? <InfoRow label="Categoría" value={producto.categoria} /> : null}
      {producto.variantes.length > 0 ? <>
        <ThemedText type="subtitle" accessibilityRole="header">Variantes</ThemedText>
        <ChoiceChips options={producto.variantes.map((v) => ({ value: v.id, label: [v.presentacion, v.tono].filter(Boolean).join(' · ') || `Variante ${v.id}` }))} selected={variantId} onSelect={seleccionarVariante} />
        {selected ? <View>
          <InfoRow label="Precio" value={formatPrice(selected.precio)} accent />
          <InfoRow label="Existencia" value={selected.stock > 0 ? `${selected.stock} disponibles` : 'Agotado'} />
          <ResourceStatus {...cart} />
          {cart.authenticated ? <Button label="Agregar al carrito" loading={cart.ocupado} disabled={cart.ocupado || selected.stock <= 0} onPress={() => { void cart.agregar(); }} /> : <Link href={{ pathname: '/autenticacion', params: { returnTo: '/productos/' + id } }} asChild><Button label="Inicia sesión para agregar al carrito" /></Link>}
          <Link href="/carrito" asChild><Button label="Ver carrito" variant="secondary" /></Link>
        </View> : null}
      </> : <InfoRow label="Precio" value={producto.precio == null ? 'Precio no disponible' : formatPrice(producto.precio)} accent />}
    </> : null}
    {producto ? <><ResourceStatus {...favorite} /><Button label={favorite.label} variant="secondary" loading={favorite.ocupado} disabled={favorite.ocupado} onPress={favorite.toggle} /></> : null}
  </Screen>;
}
