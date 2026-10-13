import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { MenuRow, SectionHeading } from '@/components/ui/style-guide';
import { useConfiguracionViewModel } from '@/modules/configuracion/viewmodels/use-configuracion-view-model';
import { Sizes, Spacing } from '@/theme';

export default function ConfiguracionView() {
  const { preferencias, seguridad } = useConfiguracionViewModel();
  return (
    <Screen title="Configuración" backHref="/perfil">
      <View style={styles.section}>
        <SectionHeading title="Preferencias" />
        {preferencias.map((acceso) => <MenuRow key={acceso.label} {...acceso} />)}
      </View>
      <View style={styles.section}>
        <Link href="/cuenta/seguridad" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Ver seguridad" style={styles.sectionLink}>
            <ThemedText type="subtitle" accessibilityRole="header">Seguridad</ThemedText>
          </Pressable>
        </Link>
        {seguridad.map((acceso) => <MenuRow key={acceso.label} {...acceso} />)}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  sectionLink: { minHeight: Sizes.controlMinHeight, justifyContent: 'center' },
});
