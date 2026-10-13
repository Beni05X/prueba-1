import { ChoiceChips } from './style-guide';
import type { Horario } from '@/modules/agenda/models/cita';
export function HorariosSelector({ horarios, selected, onSelect, disabled }: { horarios: readonly Horario[]; selected: string | null; onSelect: (hora: string) => void; disabled: boolean }) {
  return <ChoiceChips options={horarios.filter((slot) => slot.disponible).map((slot) => ({ value: slot.hora, label: slot.hora }))} selected={selected} onSelect={onSelect} disabled={disabled} />;
}
