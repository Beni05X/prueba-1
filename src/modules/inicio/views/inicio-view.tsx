import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { CatalogCard, Icon, SearchField, SectionHeading } from '@/components/ui/style-guide';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/async-states';
import { Touchable } from '@/components/ui/touchable';
import { useInicioViewModel } from '@/modules/inicio/viewmodels/use-inicio-view-model';
import { IconSizes, Radius, Sizes, Spacing } from '@/theme';
import { useTheme } from '@/hooks/use-theme';

export default function InicioView() {
  const theme = useTheme();
  const { saludo, autenticado, categorias, destacados, busqueda, cambiarBusqueda, cargando, error, vacio, sinResultados, recargar, proximaCita, errorAgenda, recargarAgenda, cargandoAgenda } = useInicioViewModel();
  return (
    <Screen title={saludo} subtitle="Todo lo que necesitas en un solo lugar.">
      <SearchField placeholder="Buscar servicios…" value={busqueda} onChangeText={cambiarBusqueda} />
      <View style={styles.section}>
        <SectionHeading title="Categorías" />
        <View style={styles.columns}>
          {categorias.map((category) => (
            <Link key={category.title} href={category.href} asChild>
              <Touchable accessibilityRole="link" style={StyleSheet.flatten([styles.category, { backgroundColor: theme.primarySoft }])}>
                <Icon name={category.icon} size={IconSizes.medium} color={theme.primary} />
                <ThemedText type="label" style={styles.centered}>{category.title}</ThemedText>
              </Touchable>
            </Link>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <SectionHeading title="Servicios destacados" action="Ver todos" href="/catalogo" />
        {cargando ? <LoadingState label="Cargando servicios…" /> : null}
        {!cargando && error ? <ErrorState message={error} onRetry={recargar} /> : null}
        {!cargando && !error && vacio ? <EmptyState title="No hay servicios disponibles" /> : null}
        {!cargando && !error && sinResultados ? <EmptyState title="No hay servicios que coincidan" description="Prueba otro nombre o categoría." /> : null}
        {!cargando && !error && !vacio ? <View style={styles.columns}>
          {destacados.map((service) => (
            <View key={service.id} style={styles.column}>
              <CatalogCard title={service.title} price={service.price} kind="service" href={service.href} image={service.image} compact />
            </View>
          ))}
        </View> : null}
      </View>
      <View style={styles.section}>
        <SectionHeading title="Tu agenda" />
        {autenticado && cargandoAgenda ? <LoadingState label="Consultando tus citas…" /> : null}
        {autenticado && errorAgenda ? <ErrorState message={errorAgenda} onRetry={recargarAgenda} /> : null}
        <Link href="/agenda" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Ver próxima cita en mi agenda">
            <ThemedView surface="card" style={styles.appointment}>
              <View style={styles.column}>
                <ThemedText type="label">{autenticado ? proximaCita?.servicioNombre ?? 'Consultar mis citas' : 'Inicia sesión para consultar tus citas'}</ThemedText>
                <ThemedText type="auxiliary" themeColor="textSecondary">{autenticado ? proximaCita ? new Date(proximaCita.fecha).toLocaleDateString('es-MX') + ' · ' + proximaCita.hora + ' · ' + proximaCita.estado : !cargandoAgenda && !errorAgenda ? 'No tienes citas próximas.' : 'Abre tu agenda personal.' : 'Tu agenda personal está vinculada a tu cuenta.'}</ThemedText>
              </View>
            </ThemedView>
          </Pressable>
        </Link>
      </View>
      {!autenticado ? <Link href="/autenticacion" asChild>
        <Pressable accessibilityRole="link" style={styles.accessLink}>
          <ThemedText type="linkPrimary">Iniciar sesión o registrarse</ThemedText>
        </Pressable>
      </Link> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.three },
  columns: { flexDirection: 'row', gap: Spacing.two },
  column: { flex: 1, gap: Spacing.one, minWidth: 0 },
  category: { flex: 1, minWidth: 0, minHeight: Sizes.categoryMinHeight, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, padding: Spacing.two, borderRadius: Radius.card },
  centered: { textAlign: 'center' },
  appointment: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  accessLink: { minHeight: Sizes.touchMinWidth, justifyContent: 'center', alignSelf: 'flex-start' },
});
