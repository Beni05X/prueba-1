import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/style-guide';
import { Button } from '@/components/ui/button';
import { Touchable } from '@/components/ui/touchable';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { Sizes, Spacing } from '@/theme';
import { useAgendaViewModel } from '../viewmodels/use-agenda-view-model';
export default function ScheduleScreen() {
  const vm = useAgendaViewModel();
  return <Screen title="Mi agenda" backHref="/">
    <SegmentedControl options={vm.secciones} selected={vm.seccionSeleccionada} onSelect={vm.seleccionarSeccion} />
    <ResourceStatus {...vm} empty={!vm.citas.length} emptyTitle={vm.seccionSeleccionada === 'Próximas' ? 'No tienes citas próximas' : 'No tienes citas en el historial'} />
    <View style={styles.list}>{vm.citas.map((cita) => <View key={cita.id} style={styles.section}>
      <ThemedText type="label" themeColor="primary">{new Date(cita.fecha).toLocaleDateString('es-MX')}</ThemedText>
      <ThemedView surface="card" style={styles.section}>
        <View style={styles.appointment}><View style={styles.detail}>
          <ThemedText type="label">{cita.servicioNombre}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{cita.hora} · {cita.duracion}</ThemedText>
          <ThemedText type="label" themeColor="primary">{cita.estado}</ThemedText>
        </View><Touchable accessibilityRole="button" accessibilityState={{ expanded: vm.detalleId === cita.id }} style={styles.detailAction} onPress={() => vm.verDetalle(cita.id)}><ThemedText type="label" themeColor="primary">{vm.detalleId === cita.id ? 'Ocultar detalle' : 'Ver detalle ›'}</ThemedText></Touchable></View>
        {vm.detalleId === cita.id ? <>
        {cita.empleado ? <ThemedText type="small">{cita.empleado}</ThemedText> : null}
        {cita.notas ? <ThemedText type="small">{cita.notas}</ThemedText> : null}
        {['PENDIENTE', 'CONFIRMADA'].includes(cita.estado) ? <>
          <ThemedText type="auxiliary" themeColor="textSecondary">Puedes cancelar con más de 24 horas de anticipación.</ThemedText>
          <Button label="Cancelar cita" variant="secondary" disabled={vm.ocupado || Date.parse(cita.fecha) - vm.now <= 86400000} onPress={() => { void vm.cancelar(cita.id); }} />
        </> : null}</> : null}
      </ThemedView>
    </View>)}</View>
    <Button label="Actualizar agenda" variant="secondary" disabled={vm.cargando} onPress={() => { void vm.recargar(); }} />
    <Link href="/catalogo?categoria=Servicios" asChild><Button label="Agendar un servicio" /></Link>
  </Screen>;
}
const styles = StyleSheet.create({ list: { gap: Spacing.five }, section: { gap: Spacing.two }, appointment: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, detail: { flex: 1, gap: Spacing.two, minWidth: 0 }, detailAction: { minHeight: Sizes.touchMinWidth, justifyContent: 'center', paddingHorizontal: Spacing.one } });
