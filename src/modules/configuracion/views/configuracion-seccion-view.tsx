import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { Button } from '@/components/ui/button';
import { InfoRow, MenuRow, SectionHeading } from '@/components/ui/style-guide';
import { useTheme } from '@/hooks/use-theme';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useConfiguracionViewModel } from '../viewmodels/use-configuracion-view-model';
export function ConfiguracionSeccionView({ seccion }: { seccion: string }) {
  const colors = useTheme();
  const { session } = useAuthSession();
  const { section, appearance, setAppearance, apariencias } = useConfiguracionViewModel(seccion);
  return <>
    {section === 'apariencia' ? <>
      <SectionHeading title="Elige cómo quieres ver la aplicación" />
      <View style={styles.section}>{apariencias.map((option) => <Pressable key={option.label} accessibilityRole="radio" accessibilityState={{ checked: appearance === option.label }} onPress={() => { void setAppearance(option.label); }} style={[styles.appearanceOption, { backgroundColor: appearance === option.label ? colors.primarySoft : colors.backgroundElement }]}>
        <View style={styles.optionCopy}><ThemedText type="label">{option.label}</ThemedText><ThemedText type="auxiliary" themeColor="textSecondary">{option.description}</ThemedText></View>
        <View style={[styles.radio, { borderColor: appearance === option.label ? colors.primary : colors.textSecondary, backgroundColor: appearance === option.label ? colors.primary : colors.background }]} />
      </Pressable>)}</View>
    </> : null}
    {section === 'seguridad' ? <View style={styles.section}>
      <MenuRow label="Cambiar contraseña" description="Actualiza tu contraseña de acceso" href="/cuenta/cambiar-contrasena" emphasized />
      <MenuRow label="Mi sesión" description="Consulta tu sesión en esta app" href="/cuenta/sesiones" emphasized />
      <MenuRow label="Eliminar cuenta" description="Información para solicitar la eliminación" href="/cuenta/eliminar-cuenta" emphasized destructive />
    </View> : null}
    {section === 'idioma' ? <MenuRow label="Español" emphasized /> : null}
    {section === 'metodos-pago' ? <><ThemedView surface="card"><ThemedText themeColor="textSecondary">Elige el método de pago al confirmar tu pedido.</ThemedText></ThemedView><Link href="/carrito" asChild><Button label="Ir a mi carrito" /></Link></> : null}
    {section === 'sesiones' ? <ThemedView surface="card">
      <ThemedText type="small">Esta es la sesión que estás usando en la app.</ThemedText>
      {session ? <InfoRow label="Vigencia" value={new Date(session.expires).toLocaleString('es-MX')} /> : null}
      <Link href="/cuenta/cerrar-sesion" asChild><Button label="Cerrar esta sesión" variant="secondary" /></Link>
    </ThemedView> : null}
  </>;
}
