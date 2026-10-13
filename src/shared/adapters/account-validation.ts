import { AdapterError } from './adapter-error';
import { calendarDate, decimal, text } from './validation';
import { InputError } from './input-error';
export function integer(value: unknown, path: string, minimum = 0): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < minimum) throw new AdapterError(path, 'entero válido');
  return value;
}
export function apiId(value: string): number {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) throw new InputError('Identificador inválido.');
  return Number(value);
}
export function instant(value: unknown, path: string): string {
  const result = text(value, path);
  if (!Number.isFinite(Date.parse(result))) throw new AdapterError(path, 'fecha válida');
  return result;
}
export function day(value: string): string {
  try { return calendarDate(value, 'fecha')!; } catch { throw new InputError('Ingresa una fecha válida en formato AAAA-MM-DD.'); }
}
export function hour(value: unknown): string {
  const result = text(value, 'hora');
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(result)) throw new Error('Selecciona una hora válida.');
  return result;
}
export function cents(value: string | number): bigint {
  const raw = decimal(value, 'importe');
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) throw new AdapterError('importe', 'importe positivo con centavos');
  const [whole, fraction = ''] = raw.split('.');
  return BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
}
export function money(value: bigint): string { return (value / 100n).toString() + '.' + (value % 100n).toString().padStart(2, '0'); }
