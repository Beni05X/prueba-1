import { StyleSheet, View } from 'react-native';
import { CustomButton as Button } from './button';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/theme';
export function PaginationControls({ page, pages, previousDisabled, nextDisabled, previous, next }: { page: number; pages: number; previousDisabled: boolean; nextDisabled: boolean; previous: () => void; next: () => void }) {
  return <View style={styles.row}><Button label="Anterior" variant="secondary" disabled={previousDisabled} onPress={previous} /><ThemedText type="label" accessibilityLiveRegion="polite">Página {page} de {pages}</ThemedText><Button label="Siguiente" variant="secondary" disabled={nextDisabled} onPress={next} /></View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: Spacing.two } });
