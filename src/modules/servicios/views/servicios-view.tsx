import { StyleSheet, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Screen } from '@/components/ui/screen';
import { MediaPlaceholder } from '@/components/ui/style-guide';
import { ReservaForm } from '@/modules/agenda/views/reserva-form';
import { useFavoriteAction } from '@/modules/favoritos/viewmodels/use-favorite-action';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/async-states';
import { Spacing } from '@/theme';
import { useServiciosViewModel } from '@/modules/servicios/viewmodels/use-servicios-view-model';
import { Button } from '@/components/ui/button';

export default function ServicesScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { servicio, precio, duracion, incluye, cargando, error, recargar } = useServiciosViewModel(id);
  const favorite = useFavoriteAction('Servicios', id);

  if (!servicio) {
    if (!id) return <Screen title="Servicios"><EmptyState title="Explora los servicios disponibles" description="Consulta el catálogo para ver servicios publicados y sus precios." /><Link href="/catalogo?categoria=Servicios" asChild><Button label="Ver servicios" /></Link></Screen>;
    return <Screen title="Detalle" backHref="/catalogo"><>{cargando ? <LoadingState label="Cargando servicio…" /> : null}{!cargando && error ? <ErrorState message={error} onRetry={recargar} /> : null}{!cargando && !error ? <EmptyState title="Servicio no disponible" description="Vuelve al catálogo para explorar servicios." /> : null}</></Screen>;
  }

  return (
    <Screen title="Detalle" backHref="/catalogo">
      <MediaPlaceholder label={servicio.nombre} source={servicio.imagen} />
      <View style={styles.heading}>
        <ThemedText type="title" accessibilityRole="header">{servicio.nombre}</ThemedText>
        <ThemedText type="subtitle" themeColor="primary" style={styles.price}>{precio}</ThemedText>
      </View>
      {servicio.descripcion ? <View style={styles.section}>
        <ThemedText type="subtitle" accessibilityRole="header">Descripción</ThemedText>
        <ThemedText themeColor="textSecondary">{servicio.descripcion}</ThemedText>
      </View> : null}
      {duracion ? <ThemedText type="label">{duracion}</ThemedText> : null}
      {incluye ? <View style={styles.section}>
        <ThemedText type="subtitle" accessibilityRole="header">Incluye</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{incluye}</ThemedText>
      </View> : null}
      <View style={styles.action}><ReservaForm servicio={servicio} /></View>
      <ResourceStatus {...favorite} />
      <Button label={favorite.label} variant="secondary" loading={favorite.ocupado} disabled={favorite.ocupado} onPress={favorite.toggle} />
    </Screen>
  );
}

const styles = StyleSheet.create({ heading: { gap: Spacing.one }, price: { alignSelf: 'flex-end' }, section: { gap: Spacing.two }, action: { paddingTop: Spacing.four } });
