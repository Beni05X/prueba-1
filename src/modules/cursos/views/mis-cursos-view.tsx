import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { InfoRow, MenuRow } from '@/components/ui/style-guide';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useMisCursosViewModel } from '../viewmodels/use-mis-cursos-view-model';
import { formatPrice } from '@/utils/format-price';
export function MisCursosView() {
  const vm = useMisCursosViewModel();
  return <><ResourceStatus {...vm} empty={!vm.cursos.length} emptyTitle="No tienes inscripciones" />
    {vm.cursos.map((item) => <ThemedView key={item.id} surface="card">
      <ThemedText type="subtitle">{item.nombre ?? 'Curso sin información publicada'}</ThemedText>
      <InfoRow label="Estado" value={item.estado} />
      <InfoRow label="Inscripción" value={new Date(item.fecha).toLocaleDateString('es-MX')} />
      {item.precio !== null ? <InfoRow label="Precio" value={formatPrice(item.precio)} /> : null}
      <InfoRow label="Pagado" value={formatPrice(item.totalPagado)} />
      <InfoRow label="Días asistidos" value={String(item.diasAsistidos)} />
      {item.pagos.map((pago) => <View key={pago.id}><InfoRow label={'Pago #' + pago.id + ' · ' + pago.estado} value={formatPrice(pago.monto)} /></View>)}
      {item.cursoId ? <MenuRow label="Ver curso" href={{ pathname: '/cursos', params: { id: item.cursoId } }} /> : null}
    </ThemedView>)}
    <MenuRow label="Explorar cursos" href="/catalogo?categoria=Cursos" />
  </>;
}
