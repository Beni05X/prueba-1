import { Link, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CustomButton as Button } from '@/components/ui/button';
import { Spacing } from '@/theme';

export function VerificacionCorreo({ correo, mensaje, cargando, reenviar, loginHref }: { correo: string; mensaje?: string; cargando: boolean; reenviar: () => Promise<void>; loginHref?: Href }) {
  return <View style={styles.content}>
    <ThemedText type="subtitle" accessibilityRole="header">Verifica tu correo</ThemedText>
    <ThemedText type="small">{mensaje ?? 'Verifica tu correo antes de iniciar sesión.'}</ThemedText>
    <ThemedText type="small" themeColor="textSecondary">Revisa la bandeja de entrada y spam de {correo}. Abre el enlace de verificación y después vuelve a iniciar sesión.</ThemedText>
    <Button label="Reenviar verificación" variant="secondary" loading={cargando} onPress={() => { void reenviar(); }} />
    {loginHref ? <Link href={loginHref} replace asChild><Button label="Volver a iniciar sesión" /></Link> : null}
  </View>;
}
const styles = StyleSheet.create({ content: { gap: Spacing.three } });
