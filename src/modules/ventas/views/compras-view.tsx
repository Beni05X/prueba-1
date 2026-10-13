import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InfoRow } from '@/components/ui/style-guide';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useComprasViewModel } from '../viewmodels/use-compras-view-model';
import { formatPrice } from '@/utils/format-price';
export function ComprasView() {
  const vm = useComprasViewModel();
  return <><ResourceStatus {...vm} empty={!vm.compras.length} emptyTitle="No tienes compras registradas" />
    {vm.compras.map((item) => <ThemedView key={item.id} surface="card">
      <ThemedText type="subtitle">Pedido #{item.id}</ThemedText>
      <InfoRow label="Estado" value={item.estado} />
      <InfoRow label="Fecha" value={new Date(item.fecha).toLocaleDateString('es-MX')} />
      {item.detalles.map((detail) => <InfoRow key={detail.id} label={detail.nombre + (detail.variante ? ' · ' + detail.variante : '') + ' × ' + detail.cantidad} value={formatPrice(detail.subtotal)} />)}
      <InfoRow label="Subtotal" value={formatPrice(item.subtotal)} /><InfoRow label="Envío" value={formatPrice(item.envio)} /><InfoRow label="Total" value={formatPrice(item.total)} accent />
      <InfoRow label="Método de pago" value={item.metodoPago || 'Sin método registrado'} />
    </ThemedView>)}
  </>;
}
