import { useRef } from 'react';
import { Link } from 'expo-router';
import { StyleSheet, View, type TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CustomButton as Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { Touchable } from '@/components/ui/touchable';
import { AppFooter } from '@/components/layout/app-footer';
import { CustomInput as TextField } from '@/components/ui/text-field';
import { StatusMessage } from '@/components/feedback/status-message';
import { useAutenticacionViewModel } from '@/modules/auth/viewmodels/use-autenticacion-view-model';
import { Spacing } from '@/theme';
import { accountSectionStyles as formStyles } from '@/components/ui/account-section-styles';
import { VerificacionCorreo } from './verificacion-correo';

export default function AutenticacionView() {
  const vm = useAutenticacionViewModel();
  const password = useRef<TextInput>(null);
  return (
    <Screen brand title="Bienvenida de nuevo" subtitle="Inicia sesión para continuar">
      <View style={formStyles.form}>
        <TextField label="Correo electrónico" value={vm.campos.correo} onChangeText={vm.cambiarCorreo} error={vm.erroresCampos.correo} editable={!vm.cargando} placeholder="Tu correo electrónico" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" returnKeyType="next" onSubmitEditing={() => password.current?.focus()} />
        <TextField ref={password} label="Contraseña" value={vm.campos.password} onChangeText={vm.cambiarPassword} error={vm.erroresCampos.password} editable={!vm.cargando} placeholder="••••••••" secureTextEntry={!vm.visibilidad.password} onTogglePassword={() => vm.alternarVisibilidad('password')} autoCapitalize="none" autoCorrect={false} autoComplete="current-password" returnKeyType="go" onSubmitEditing={() => { void vm.iniciarSesion(); }} />
        <Link href={vm.recuperarHref} asChild><Touchable accessibilityRole="link" style={formStyles.centeredLink}><ThemedText type="label" themeColor="primary">¿Olvidaste tu contraseña?</ThemedText></Touchable></Link>
        {vm.error ? <StatusMessage message={vm.error} /> : null}
        <Button label="Iniciar sesión" disabled={vm.cargando} loading={vm.operacionPendiente === 'Acceso'} onPress={() => { void vm.iniciarSesion(); }} />
        {vm.correoVerificacion ? <VerificacionCorreo correo={vm.correoVerificacion} cargando={vm.cargando} reenviar={vm.reenviarVerificacion} /> : null}
        {!vm.correoVerificacion ? <Button label="Reenviar verificación" variant="secondary" disabled={vm.cargando} loading={vm.operacionPendiente === 'Reenvío de verificación'} onPress={() => { void vm.reenviarVerificacion(); }} /> : null}
        {vm.mensaje ? <StatusMessage message={vm.mensaje} tone="info" /> : null}
      </View>
      <View style={styles.createAccount}>
        <ThemedText type="small" themeColor="textSecondary">¿No tienes una cuenta?</ThemedText>
        <Link href={vm.registroHref} asChild><Touchable accessibilityRole="link" style={formStyles.centeredLink}><ThemedText type="label" themeColor="primary">Crear cuenta</ThemedText></Touchable></Link>
      </View>
      <AppFooter><ThemedText type="auxiliary" themeColor="textSecondary">Al continuar aceptas nuestros Términos y Aviso de privacidad.</ThemedText></AppFooter>
      <Link href="/" dismissTo asChild><Button label="Volver al inicio" variant="secondary" /></Link>
    </Screen>
  );
}
const styles = StyleSheet.create({
  createAccount: { marginTop: Spacing.four, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, alignItems: 'center', justifyContent: 'center' },
});
