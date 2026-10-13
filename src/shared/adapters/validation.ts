import { AdapterError } from './adapter-error';

export function record(value: unknown, path: string): Record<string, unknown> {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new AdapterError(path, 'un objeto');
  }
  return value as Record<string, unknown>;
}

export function list(value: unknown, path: string): readonly unknown[] {
  if (!Array.isArray(value)) throw new AdapterError(path, 'una lista');
  return value;
}

export function text(value: unknown, path: string): string {
  if (typeof value !== 'string') throw new AdapterError(path, 'texto');
  return value;
}

export function nullableText(value: unknown, path: string): string | null {
  return value === null ? null : text(value, path);
}

export function finiteNumber(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new AdapterError(path, 'un número finito');
  }
  return value;
}

export function nullableNumber(value: unknown, path: string): number | null {
  return value === null ? null : finiteNumber(value, path);
}

export function identifier(value: unknown, path: string): string {
  const id = finiteNumber(value, path);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new AdapterError(path, 'un identificador entero positivo seguro');
  }
  return String(id);
}

/** Keep decimal strings intact. Never round money or replace a missing amount. */
export function decimal(value: unknown, path: string): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new AdapterError(path, 'un importe decimal');
  }
  if (typeof value === 'number' && (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER)) {
    throw new AdapterError(path, 'un importe decimal representable');
  }
  const result = String(value);
  if (!/^-?\d+(?:\.\d+)?$/.test(result)) {
    throw new AdapterError(path, 'un importe decimal sin exponentes');
  }
  if (typeof value === 'number') {
    const [integer, fraction = ''] = result.split('.');
    // These backend endpoints serialize Decimal(10,2) as JSON numbers.
    // Reject lost precision instead of rounding it into an apparently valid price.
    const cents = BigInt(integer.replace('-', '') + fraction.padEnd(2, '0'));
    if (fraction.length > 2 || cents > BigInt(Number.MAX_SAFE_INTEGER)) {
      throw new AdapterError(path, 'un importe numérico con centavos exactos y seguros');
    }
  }
  return result;
}

/** Preserve the numeric representation of a backend Float without rounding. */
export function numericDecimal(value: unknown, path: string): string {
  const amount = finiteNumber(value, path);
  if (Math.abs(amount) > Number.MAX_SAFE_INTEGER) {
    throw new AdapterError(path, 'un importe numérico representable');
  }
  const raw = String(amount);
  if (!/[eE]/.test(raw)) return decimal(raw, path);
  const match = /^(-?)(\d+)(?:\.(\d+))?e([+-]?\d+)$/.exec(raw);
  if (!match) throw new AdapterError(path, 'un importe numérico decimal');
  const [, sign, integer, fraction = '', exponent] = match;
  const digits = integer + fraction;
  const position = integer.length + Number(exponent);
  const expanded = position <= 0
    ? '0.' + '0'.repeat(-position) + digits
    : position >= digits.length
      ? digits + '0'.repeat(position - digits.length)
      : digits.slice(0, position) + '.' + digits.slice(position);
  return decimal(sign + expanded, path);
}

/** Prisma @db.Date is a calendar day, not an instant in the device's timezone. */
export function calendarDate(value: unknown, path: string): string | null {
  if (value === null) return null;
  const raw = text(value, path);
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T00:00:00(?:\.000)?Z)?$/.exec(raw);
  if (!match) throw new AdapterError(path, 'una fecha de calendario ISO');
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > days[month - 1]) {
    throw new AdapterError(path, 'una fecha de calendario válida');
  }
  return `${yearText}-${monthText}-${dayText}`;
}
