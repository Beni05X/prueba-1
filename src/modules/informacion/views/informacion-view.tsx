import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { InfoRow, MenuRow, SectionHeading } from '@/components/ui/style-guide';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { useInformacionViewModel } from '../viewmodels/use-informacion-view-model';
import { getApiUrl } from '@/config/api';
import appConfig from '../../../../app.json';
export function InformacionView({ seccion }: { seccion: string }) {
  const vm = useInformacionViewModel(seccion);
  const officialPath = seccion === 'terminos' ? '/terminos' : seccion === 'privacidad' || seccion === 'cookies' ? '/aviso-privacidad' : '/politicas';
  return <>
    {seccion === 'ayuda' ? <>
      <TextField value={vm.busqueda} onChangeText={vm.cambiarBusqueda} label="Buscar una pregunta" placeholder="Buscar una pregunta" />
      <SectionHeading title="Preguntas frecuentes" />
      <ResourceStatus {...vm} empty={!vm.preguntas.length} emptyTitle="No hay preguntas para mostrar" />
      <View style={styles.section}>{vm.preguntas.map((item) => <ThemedView key={item.id} surface="card"><ThemedText type="label">{item.pregunta}</ThemedText><ThemedText type="small" themeColor="textSecondary">{item.respuesta}</ThemedText></ThemedView>)}</View>
    </> : null}
    {seccion === 'legal' ? <View style={styles.section}>
      <SectionHeading title="Información legal" />
      <MenuRow label="Términos y condiciones" href="/cuenta/terminos" emphasized />
      <MenuRow label="Aviso de privacidad" href="/cuenta/privacidad" emphasized />
      <MenuRow label="Política de cancelaciones" href="/cuenta/cancelaciones" emphasized />
      <MenuRow label="Política de reembolsos" href="/cuenta/reembolsos" emphasized />
      <MenuRow label="Uso de cookies" href="/cuenta/cookies" emphasized />
    </View> : null}
    {['terminos', 'privacidad', 'cancelaciones', 'reembolsos', 'cookies'].includes(seccion) ? <View style={styles.legalCopy}>
      <ThemedText type="small" themeColor="textSecondary">Consulta la información vigente publicada por el salón.</ThemedText>
      <Button label="Consultar información oficial" onPress={() => { void vm.abrir(getApiUrl() + officialPath); }} />
      <ResourceStatus {...vm} />
    </View> : null}
    {seccion === 'acerca' ? <>
      <ThemedText type="title" themeColor="primary">SALÓN BRENN’S</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">Servicios · Cursos · Productos · Agenda</ThemedText>
      <ThemedView surface="card"><InfoRow label="Versión" value={appConfig.expo.version} /></ThemedView>
    </> : null}
    {vm.contacto ? <Button label="Contactar al salón" variant="secondary" onPress={() => { void vm.abrir(vm.contacto!); }} /> : null}
  </>;
}
