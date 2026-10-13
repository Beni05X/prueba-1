import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Touchable } from './touchable';
import { CustomButton as Button } from './button';
import { useTheme } from '@/hooks/use-theme';
import { Radius, Sizes, Spacing } from '@/theme';
import type { useCalendarViewModel } from '@/shared/viewmodels/use-calendar-view-model';
type CalendarVm = ReturnType<typeof useCalendarViewModel>;
export function Calendar({ vm, selected, onSelect, disabled }: { vm: CalendarVm; selected: string; onSelect: (date: string) => void; disabled: boolean }) {
  const theme = useTheme();
  return <View style={styles.calendar}>
    <View style={styles.heading}><Button label="Anterior" variant="secondary" disabled={disabled || !vm.canPrevious} onPress={vm.previous} /><ThemedText type="label" style={styles.title}>{vm.title}</ThemedText><Button label="Siguiente" variant="secondary" disabled={disabled} onPress={vm.next} /></View>
    <View style={styles.grid}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => <View key={index} style={styles.day}><ThemedText type="label">{day}</ThemedText></View>)}</View>
    <View style={styles.grid}>{vm.days.map((day, index) => day ? <Touchable key={day} accessibilityRole="button" accessibilityLabel={day} accessibilityState={{ selected: selected === day, disabled: disabled || !vm.selectable(day) }} disabled={disabled || !vm.selectable(day)} onPress={() => onSelect(day)} style={[styles.day, { borderRadius: Radius.control, backgroundColor: selected === day ? theme.primary : theme.backgroundElement, opacity: !vm.selectable(day) ? 0.35 : 1 }]}><ThemedText themeColor={selected === day ? 'onPrimary' : 'text'}>{Number(day.slice(-2))}</ThemedText></Touchable> : <View key={'empty-' + index} style={styles.day} />)}</View>
  </View>;
}
const styles = StyleSheet.create({ calendar: { gap: Spacing.two }, heading: { gap: Spacing.one, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }, title: { flex: 1, minWidth: 80, textAlign: 'center' }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, day: { width: '14.2857%', minHeight: Sizes.controlMinHeight, justifyContent: 'center', alignItems: 'center' } });
