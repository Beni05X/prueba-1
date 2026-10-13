import { ThemedText } from '@/components/themed-text';
import { MenuRow } from '@/components/ui/style-guide';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useNotificacionesViewModel } from '../viewmodels/use-notificaciones-view-model';
export function NotificacionesView() {
  const vm = useNotificacionesViewModel();
  return <><ThemedText type="small" themeColor="textSecondary">Citas en las próximas 48 horas y pedidos en camino.</ThemedText>
    <ResourceStatus {...vm} empty={!vm.recordatorios.length} emptyTitle="No tienes recordatorios" />
    {vm.recordatorios.map((item) => <MenuRow key={item.id} label={item.titulo} description={item.detalle} href={item.href} />)}
  </>;
}
