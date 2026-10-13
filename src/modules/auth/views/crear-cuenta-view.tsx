import { useRef } from 'react';
import { Link } from 'expo-router';
import { StyleSheet, View, type TextInput } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CustomButton as Button } from '@/components/ui/button';
import { CustomInput as TextField } from '@/components/ui/text-field';
import { Touchable } from '@/components/ui/touchable';
import { StatusMessage } from '@/components/feedback/status-message';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Sizes, Spacing } from '@/theme';
import { accountSectionStyles as formStyles } from '@/components/ui/account-section-styles';
import type { useAutenticacionViewModel } from '../viewmodels/use-autenticacion-view-model';
import { VerificacionCorreo } from './verificacion-correo';

export function CrearCuentaView({ model: vm }: { model: ReturnType<typeof useAutenticacionViewModel> }) {
  const theme = useTheme();
  const email = useRef<TextInput>(null);
  const phone = useRef<TextInput>(null);
  const password = useRef<TextInput>(null);
  const confirmation = useRef<TextInput>(null);
  if (vm.registro) return <View style={formStyles.form}>
    {vm.registro.requiresVerification && vm.correoVerificacion ? <VerificacionCorreo correo={vm.correoVerificacion} mensaje={vm.registro.message} cargando={vm.cargando} reenviar={vm.reenviarVerificacion} loginHref={vm.loginHref} />
      : <><StatusMessage message={vm.registro.message} tone="success" /><Link href={vm.loginHref} replace asChild><Button label="Ir a iniciar sesión" /></Link></>}
    {vm.error ? <StatusMessage message={vm.error} /> : null}
    {vm.mensaje ? <StatusMessage message={vm.mensaje} tone="info" /> : null}
  </View>;

  return <View style={formStyles.form}>
    <View style={styles.heading}>
      <ThemedText type="title" accessibilityRole="header">Crea tu cuenta</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">Completa tus datos para comenzar</ThemedText>
    </View>
    <TextField label="Nombre completo" placeholder="Tu nombre" autoComplete="name" autoCapitalize="words" value={vm.campos.nombre} onChangeText={vm.cambiarNombre} error={vm.erroresCampos.nombre} editable={!vm.cargando} returnKeyType="next" onSubmitEditing={() => email.current?.focus()} />
    <TextField ref={email} label="Correo electrónico" placeholder="Tu correo electrónico" keyboardType="email-address" autoComplete="email" autoCapitalize="none" autoCorrect={false} value={vm.campos.correo} onChangeText={vm.cambiarCorreo} error={vm.erroresCampos.correo} editable={!vm.cargando} returnKeyType="next" onSubmitEditing={() => phone.current?.focus()} />
    <TextField ref={phone} label="Teléfono" placeholder="Tu teléfono" keyboardType="phone-pad" autoComplete="tel" value={vm.campos.telefono} onChangeText={vm.cambiarTelefono} error={vm.erroresCampos.telefono} editable={!vm.cargando} returnKeyType="next" onSubmitEditing={() => password.current?.focus()} />
    <TextField ref={password} label="Contraseña" placeholder="Al menos 8 caracteres" autoComplete="new-password" autoCapitalize="none" autoCorrect={false} secureTextEntry={!vm.visibilidad.password} onTogglePassword={() => vm.alternarVisibilidad('password')} value={vm.campos.password} onChangeText={vm.cambiarPassword} error={vm.erroresCampos.password} editable={!vm.cargando} returnKeyType="next" onSubmitEditing={() => confirmation.current?.focus()} />
    <TextField ref={confirmation} label="Confirmar contraseña" placeholder="Repite tu contraseña" autoComplete="new-password" autoCapitalize="none" autoCorrect={false} secureTextEntry={!vm.visibilidad.confirmacionPassword} onTogglePassword={() => vm.alternarVisibilidad('confirmacionPassword')} value={vm.campos.confirmacionPassword} onChangeText={vm.cambiarConfirmacionPassword} error={vm.erroresCampos.confirmacionPassword} editable={!vm.cargando} returnKeyType="done" onSubmitEditing={() => { void vm.crearCuenta(); }} />
    <Touchable accessibilityRole="checkbox" accessibilityState={{ checked: vm.aceptaTerminos }} onPress={vm.cambiarAceptaTerminos} disabled={vm.cargando} style={styles.terms}>
      <View style={[styles.checkbox, { borderColor: theme.primary, backgroundColor: vm.aceptaTerminos ? theme.primary : theme.backgroundElement }]}>
        {vm.aceptaTerminos ? <ThemedText themeColor="onPrimary" type="small">✓</ThemedText> : null}
      </View>
      <ThemedText type="auxiliary" style={styles.copy}>Acepto los Términos y el Aviso de privacidad</ThemedText>
    </Touchable>
    {vm.error ? <StatusMessage message={vm.error} /> : null}
    <Button label="Crear cuenta" loading={vm.operacionPendiente === 'Registro'} disabled={vm.cargando} onPress={() => { void vm.crearCuenta(); }} />
    <Link href={vm.loginHref} replace asChild><Touchable accessibilityRole="link" style={formStyles.centeredLink}><ThemedText type="label" themeColor="primary">Ya tengo cuenta · Iniciar sesión</ThemedText></Touchable></Link>
  </View>;
}
const styles = StyleSheet.create({
  heading: { gap: Spacing.one },
  terms: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two }, copy: { flex: 1 },
  checkbox: { width: Spacing.four, height: Spacing.four, borderWidth: Sizes.borderWidth, borderRadius: Radius.control / 3, alignItems: 'center', justifyContent: 'center' },
});
