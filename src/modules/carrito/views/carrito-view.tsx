import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { ChoiceChips, InfoRow, MediaPlaceholder } from '@/components/ui/style-guide';
import { Button } from '@/components/ui/button';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { ErrorState } from '@/components/feedback/async-states';
import { useCarritoViewModel } from '../viewmodels/use-carrito-view-model';
import { formatPrice } from '@/utils/format-price';
import { Sizes, Spacing } from '@/theme';
export default function CarritoView() {
  const vm = useCarritoViewModel();
  return <Screen title="Mi carrito">
    <ResourceStatus {...vm} empty={vm.items.length === 0} emptyTitle="Tu carrito está vacío" />
    <View style={styles.list}>{vm.items.map((item) => <ThemedView key={item.id} surface="card" style={styles.item}>
      <View style={styles.thumbnail}><MediaPlaceholder compact /></View>
      <View style={styles.description}>
        <ThemedText type="label">{item.titulo}</ThemedText>
        {item.variante ? <ThemedText type="small" themeColor="textSecondary">{item.variante}</ThemedText> : null}
        <ThemedText type="small" themeColor="primary">{formatPrice(item.precio)} × {item.cantidad}</ThemedText>
        <View style={styles.controls}>
          <Button label="−" accessibilityLabel={'Reducir cantidad de ' + item.titulo} variant="secondary" disabled={vm.ocupado || item.cantidad <= 0} onPress={() => { void vm.cambiarCantidad(item.id, item.cantidad - 1); }} />
          <Button label="+" accessibilityLabel={'Aumentar cantidad de ' + item.titulo} variant="secondary" disabled={vm.ocupado || item.cantidad >= item.stock} onPress={() => { void vm.cambiarCantidad(item.id, item.cantidad + 1); }} />
          <Button label="Eliminar" variant="secondary" disabled={vm.ocupado} onPress={() => { void vm.eliminar(item.id); }} />
        </View>
      </View>
    </ThemedView>)}</View>
    {vm.resumen && vm.items.length > 0 ? <>
      <ThemedView surface="card" style={styles.summary}>
        <InfoRow label="Subtotal" value={formatPrice(vm.resumen.subtotal)} />
        <InfoRow label="Envío" value={formatPrice(vm.resumen.envio)} />
        <InfoRow label="Total" value={formatPrice(vm.resumen.total)} accent />
      </ThemedView>
      <Button label="Vaciar carrito" variant="secondary" disabled={vm.ocupado} onPress={() => { void vm.vaciar(); }} />
      {vm.errorPerfil ? <ErrorState message={vm.errorPerfil} onRetry={vm.recargarPerfil} /> : null}
      {vm.perfil ? <><ThemedText type="label">Datos del pedido</ThemedText>
        <InfoRow label="Nombre" value={vm.perfil.nombre} /><InfoRow label="Correo" value={vm.perfil.correo} />
        <Link href="/cuenta/editar-perfil" asChild><Button label="Editar datos" variant="secondary" /></Link>
        <ChoiceChips options={[{ value: 'transferencia', label: 'Transferencia' }, { value: 'efectivo', label: 'Efectivo' }, { value: 'tarjeta', label: 'Tarjeta' }]} selected={vm.metodoPago} onSelect={vm.cambiarMetodoPago} />
        <ThemedText type="small" themeColor="textSecondary">Al confirmar se creará tu pedido. El estado del pago se consulta en Mis compras.</ThemedText>
      </> : null}
      {!vm.existenciasValidas ? <ThemedText type="small" themeColor="textSecondary">Revisa las cantidades y existencias antes de confirmar el pedido.</ThemedText> : null}
      <Button label="Confirmar pedido" loading={vm.ocupado} disabled={!vm.perfil || !vm.existenciasValidas || vm.cargando || vm.ocupado} onPress={() => { void vm.confirmarPedido(); }} />
    </> : null}
    <Link href="/cuenta/compras" asChild><Button label="Ver mis compras" variant="secondary" /></Link>
  </Screen>;
}
const styles = StyleSheet.create({ list: { gap: Spacing.three }, item: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three }, thumbnail: { width: Sizes.mediaThumbnail, flexShrink: 0 }, description: { flex: 1, minWidth: 0, gap: Spacing.two }, controls: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.one }, summary: { gap: Spacing.three, marginTop: Spacing.three } });
