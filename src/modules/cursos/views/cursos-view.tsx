import { StyleSheet, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Screen } from '@/components/ui/screen';
import { InfoRow, MediaPlaceholder } from '@/components/ui/style-guide';
import { InscripcionForm } from './inscripcion-form';
import { useFavoriteAction } from '@/modules/favoritos/viewmodels/use-favorite-action';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { EmptyState, ErrorState, LoadingState } from '@/components/feedback/async-states';
import { Spacing } from '@/theme';
import { useCursosViewModel } from '@/modules/cursos/viewmodels/use-cursos-view-model';
import { Button } from '@/components/ui/button';

export default function CoursesScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { curso, informacion, precio, cargando, error, recargar } = useCursosViewModel(id);
  const favorite = useFavoriteAction('Cursos', id);

  if (!curso) {
    if (!id) return <Screen title="Cursos"><EmptyState title="Explora los cursos disponibles" description="Consulta el catálogo para ver cursos publicados y sus precios." /><Link href="/catalogo?categoria=Cursos" asChild><Button label="Ver cursos" /></Link></Screen>;
    return <Screen title="Curso" backHref="/catalogo"><>{cargando ? <LoadingState label="Cargando curso…" /> : null}{!cargando && error ? <ErrorState message={error} onRetry={recargar} /> : null}{!cargando && !error ? <EmptyState title="Curso no disponible" description="Vuelve al catálogo para explorar cursos." /> : null}</></Screen>;
  }

  return (
    <Screen title="Curso" backHref="/catalogo">
      <MediaPlaceholder label={curso.nombre} source={curso.imagen} />
      <View style={styles.heading}>
        <ThemedText type="title" accessibilityRole="header">{curso.nombre}</ThemedText>
        {curso.descripcion ? <ThemedText themeColor="textSecondary">{curso.descripcion}</ThemedText> : null}
      </View>
      <View style={styles.details}>
        {informacion.map((item) => <InfoRow key={item.label} {...item} />)}
      </View>
      <ThemedView surface="card"><InfoRow label="Precio" value={precio} accent /></ThemedView>
      <InscripcionForm curso={curso} />
      <ResourceStatus {...favorite} />
      <Button label={favorite.label} variant="secondary" loading={favorite.ocupado} disabled={favorite.ocupado} onPress={favorite.toggle} />
    </Screen>
  );
}

const styles = StyleSheet.create({ heading: { gap: Spacing.two }, details: { gap: Spacing.four } });
