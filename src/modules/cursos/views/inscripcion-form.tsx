import { Link } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CustomButton as Button } from '@/components/ui/button';
import { InfoRow } from '@/components/ui/style-guide';
import { DatosTransferencia } from '@/components/ui/datos-transferencia';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useInscripcionViewModel } from '../viewmodels/use-inscripcion-view-model';
import type { Curso } from '../models/curso';
import { formatPrice } from '@/utils/format-price';
export function InscripcionForm({ curso }: { curso: Curso }) {
  const vm = useInscripcionViewModel(curso);
  if (!vm.authenticated) return <Link href={{ pathname: '/autenticacion', params: { returnTo: '/cursos?id=' + curso.id } }} asChild><Button label="Inicia sesión para inscribirte" /></Link>;
  return <View style={styles.form}><ResourceStatus {...vm} /><ResourceStatus {...vm.transferencia} />
    <ThemedText type="subtitle">Resumen de inscripción</ThemedText>
    <InfoRow label="Curso" value={curso.nombre} /><InfoRow label="Importe completo" value={formatPrice(vm.inscripcion?.monto ?? curso.precio)} accent /><InfoRow label="Método" value="Transferencia bancaria" />
    {vm.transferencia.datos && !vm.transferencia.error ? <DatosTransferencia datos={vm.transferencia.datos.banco} /> : null}
    {vm.permitido ? <ThemedText type="small" themeColor="textSecondary">La inscripción registra el importe completo como pendiente de pago. La transferencia debe realizarse por separado.</ThemedText> : <ThemedText type="small">Las inscripciones están disponibles para cuentas de cliente.</ThemedText>}
    {vm.sinCupo ? <ThemedText type="small">El cupo del curso está completo.</ThemedText> : null}
    <Button label={vm.inscrito ? 'Inscripción activa' : 'Confirmar inscripción'} disabled={!vm.puedeInscribir} loading={vm.ocupado} onPress={() => { void vm.inscribir(); }} />
    <Link href="/cuenta/cursos" asChild><Button label="Ver mis cursos" variant="secondary" /></Link>
  </View>;
}
