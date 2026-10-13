import { calendarDate } from '@/shared/adapters/validation';
export function localCalendarDay(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function calendarDayFromApi(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Fecha de calendario inválida.');
  return calendarDate(value.slice(0, 10), 'día bloqueado')!;
}
export function shiftMonth(month: string, offset: number): string {
  const [year, number] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, number - 1 + offset, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
export function selectableDay(fecha: string, today: string, blocked: readonly string[]): boolean {
  try { return calendarDate(fecha, 'fecha') === fecha && fecha >= today && !blocked.includes(fecha); } catch { return false; }
}
export function monthDays(month: string): readonly (string | null)[] {
  const [year, number] = month.split('-').map(Number);
  const first = new Date(Date.UTC(year, number - 1, 1));
  const count = new Date(Date.UTC(year, number, 0)).getUTCDate();
  return [...Array<null>((first.getUTCDay() + 6) % 7).fill(null), ...Array.from({ length: count }, (_, i) => month + '-' + String(i + 1).padStart(2, '0'))];
}
export function monthTitle(month: string): string {
  const [year, number] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, number - 1, 1)));
}
