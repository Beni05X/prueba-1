import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { InfoRow, MenuRow } from '@/components/ui/style-guide';
import { Button } from '@/components/ui/button';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { usePerfilViewModel } from '@/modules/perfil/viewmodels/use-perfil-view-model';
import { Sizes, Spacing } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export default function PerfilView() {
  const theme = useTheme();
  const vm = usePerfilViewModel();
  const { perfil, accesos } = vm;
  return (
    <Screen title="Mi perfil">
      <ResourceStatus {...vm} />
      {perfil ? <><ThemedView surface="card" style={styles.profileCard}>
        <View accessibilityElementsHidden importantForAccessibility="no" style={[styles.avatar, { backgroundColor: theme.primarySoft }]} />
        <View style={styles.user}>
          <ThemedText type="action">{perfil.nombre || 'Sin nombre registrado'}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {perfil.correo}
          </ThemedText>
          <Link href="/cuenta/editar-perfil" asChild>
            <Pressable accessibilityRole="link" style={styles.editLink}>
              <ThemedText type="label" themeColor="primary">
                Editar perfil
              </ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>
      <InfoRow label="Teléfono" value={perfil.telefono || 'Sin teléfono registrado'} />
      <InfoRow label="Miembro desde" value={perfil.fechaRegistro ? new Date(perfil.fechaRegistro).toLocaleDateString('es-MX') : 'Sin fecha registrada'} />
      <Button label="Actualizar información" variant="secondary" disabled={vm.cargando} onPress={() => { void vm.recargar(); }} /></> : null}
      <View style={styles.menu}>
        {accesos.map((acceso) => <MenuRow key={acceso.label} {...acceso} />)}
      </View>
      <Link href="/cuenta/cerrar-sesion" asChild>
        <Pressable accessibilityRole="link" style={styles.signOut}>
          <ThemedText type="label" themeColor="primary">
            Cerrar sesión
          </ThemedText>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  avatar: { width: Sizes.avatar, height: Sizes.avatar, borderRadius: Sizes.avatar / 2 },
  user: { flex: 1, gap: Spacing.one },
  editLink: { minHeight: Sizes.controlMinHeight, justifyContent: 'center', alignSelf: 'flex-start' },
  menu: { gap: Spacing.two },
  signOut: { minHeight: Sizes.controlMinHeight, alignItems: 'center', justifyContent: 'center' },
});
