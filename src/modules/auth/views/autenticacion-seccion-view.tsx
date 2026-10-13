import { Link } from 'expo-router';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { InformacionView } from '@/modules/informacion/views/informacion-view';
import { CustomButton as Button } from '@/components/ui/button';
import { CustomInput as TextField } from '@/components/ui/text-field';
import { Touchable } from '@/components/ui/touchable';
import { StatusMessage } from '@/components/feedback/status-message';
import { useAutenticacionViewModel } from '../viewmodels/use-autenticacion-view-model';
import { CrearCuentaView } from './crear-cuenta-view';

export function AutenticacionSeccionView({ seccion }: { seccion: string }) {
  const vm = useAutenticacionViewModel(seccion);
  if (vm.section === 'crear-cuenta') return <CrearCuentaView model={vm} />;
  const messages = <>
    {vm.error ? <StatusMessage message={vm.error} /> : null}
    {vm.mensaje ? <StatusMessage message={vm.mensaje} tone="info" /> : null}
  </>;
  const login = <Link href={vm.loginHref} replace asChild><Button label="Volver a iniciar sesión" variant="secondary" disabled={vm.cargando} /></Link>;
  const newPassword = <>
    <TextField value={vm.campos.password} onChangeText={vm.cambiarPassword} label="Nueva contraseña" secureTextEntry={!vm.visibilidad.password} onTogglePassword={() => vm.alternarVisibilidad('password')} error={vm.erroresCampos.password} editable={!vm.cargando} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" />
    <TextField value={vm.campos.confirmacionPassword} onChangeText={vm.cambiarConfirmacionPassword} label="Confirmar contraseña" secureTextEntry={!vm.visibilidad.confirmacionPassword} onTogglePassword={() => vm.alternarVisibilidad('confirmacionPassword')} error={vm.erroresCampos.confirmacionPassword} editable={!vm.cargando} autoCapitalize="none" autoCorrect={false} autoComplete="new-password" returnKeyType="done" onSubmitEditing={() => { void (vm.section === 'restablecer-contrasena' ? vm.restablecerContrasena() : vm.cambiarContrasena()); }} />
  </>;
  return <>
    {vm.section === 'cerrar-sesion' ? <ThemedView surface="card" style={styles.confirmation}>
      <ThemedText type="subtitle">¿Cerrar sesión?</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">¿Estás segura de que deseas cerrar tu sesión?</ThemedText>
      {messages}
      <Button label="Cerrar sesión" loading={vm.cargando} onPress={() => { void vm.cerrarSesion(); }} />
      <Link href="/perfil" asChild><Touchable disabled={vm.cargando} accessibilityRole="link" style={styles.centeredLink}><ThemedText type="label" themeColor="primary">Cancelar</ThemedText></Touchable></Link>
    </ThemedView> : null}
    {vm.section === 'recuperar-contrasena' ? <View style={styles.form}>
      <View style={styles.section}><ThemedText type="title">¿Olvidaste tu contraseña?</ThemedText><ThemedText type="small" themeColor="textSecondary">Ingresa tu correo y te enviaremos un enlace para restablecerla.</ThemedText></View>
      <TextField value={vm.campos.correo} onChangeText={vm.cambiarCorreo} label="Correo electrónico" placeholder="Tu correo electrónico" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" editable={!vm.cargando} error={vm.erroresCampos.correo} returnKeyType="send" onSubmitEditing={() => { void vm.recuperarContrasena(); }} />
      {messages}
      <Button label="Enviar enlace" loading={vm.operacionPendiente === 'Recuperación'} disabled={vm.cargando} onPress={() => { void vm.recuperarContrasena(); }} />
      {login}
    </View> : null}
    {vm.section === 'restablecer-contrasena' ? <View style={styles.form}>
      <ThemedText type="small" themeColor="textSecondary">Elige tu nueva contraseña.</ThemedText>
      {!vm.completado ? <>
        {!vm.tieneToken ? <StatusMessage message="Restablecimiento: abre el enlace recibido por correo para continuar." tone="info" /> : null}
        {newPassword}
        <Button label="Guardar nueva contraseña" loading={vm.cargando} disabled={!vm.tieneToken || vm.cargando} onPress={() => { void vm.restablecerContrasena(); }} />
      </> : null}
      {messages}
      {login}
    </View> : null}
    {vm.section === 'verificar-email' ? <View style={styles.form}>
      {!vm.completado ? <>
        <ThemedText type="small" themeColor="textSecondary">{vm.tieneToken ? 'Confirma tu correo con el enlace que recibiste.' : 'Abre el enlace recibido por correo o solicita uno nuevo.'}</ThemedText>
        <Button label="Verificar correo" loading={vm.operacionPendiente === 'Verificación de correo'} disabled={!vm.tieneToken || vm.cargando} onPress={() => { void vm.verificarCorreo(); }} />
        <TextField label="Correo para reenviar verificación" value={vm.campos.correo} onChangeText={vm.cambiarCorreo} error={vm.erroresCampos.correo} editable={!vm.cargando} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="send" onSubmitEditing={() => { void vm.reenviarVerificacion(); }} />
        <Button label="Reenviar verificación" variant="secondary" loading={vm.operacionPendiente === 'Reenvío de verificación'} disabled={vm.cargando} onPress={() => { void vm.reenviarVerificacion(); }} />
      </> : null}
      {messages}
      {login}
    </View> : null}
    {vm.section === 'cambiar-contrasena' ? <View style={styles.form}>
      <TextField value={vm.campos.passwordActual} onChangeText={vm.cambiarPasswordActual} label="Contraseña actual" secureTextEntry={!vm.visibilidad.passwordActual} onTogglePassword={() => vm.alternarVisibilidad('passwordActual')} error={vm.erroresCampos.passwordActual} editable={!vm.cargando} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" />
      {newPassword}
      {messages}
      <Button label="Guardar contraseña" loading={vm.cargando} onPress={() => { void vm.cambiarContrasena(); }} />
    </View> : null}
    {vm.section === 'eliminar-cuenta' ? <View style={styles.form}>
      <ThemedText type="title">Solicitar eliminación de cuenta</ThemedText>
      <ThemedText themeColor="textSecondary">Contacta al salón para solicitar la eliminación de tu cuenta.</ThemedText>
      <InformacionView seccion="contacto" />
    </View> : null}
  </>;
}
