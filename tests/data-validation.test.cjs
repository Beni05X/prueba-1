const assert = require('node:assert/strict');
const { test } = require('node:test');
const { AdapterError } = require('@/shared/adapters/adapter-error');
const {
  record,
  text,
  nullableText,
  identifier,
  finiteNumber,
  nullableNumber,
  list,
  decimal,
  numericDecimal,
  calendarDate,
} = require('@/shared/adapters/validation');

function rejectsInvalid(conversion, values) {
  for (const value of values) {
    assert.throws(() => conversion(value, 'respuesta.campo'), AdapterError, `Invalid value: ${String(value)}`);
  }
}

test('validation distinguishes records and lists, preserving confirmed empty lists', () => {
  const payload = { nombre: 'Tinte' };
  assert.equal(record(payload, 'producto'), payload);
  assert.deepEqual(list([], 'productos'), []);
  assert.deepEqual(list([payload], 'productos'), [payload]);
  rejectsInvalid(record, [null, undefined, [], 'object', 4]);
  rejectsInvalid(list, [null, undefined, {}, '[]']);
});

test('validation normalizes numeric IDs without accepting zero, fractions or unsafe integers', () => {
  assert.equal(identifier(12, 'producto.id'), '12');
  rejectsInvalid(identifier, [0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1, null, undefined, '12']);
});

test('validation preserves optional nulls and rejects incompatible types', () => {
  assert.equal(text('Brenn’s', 'nombre'), 'Brenn’s');
  assert.equal(nullableText(null, 'descripcion'), null);
  assert.equal(nullableText('Tratamiento', 'descripcion'), 'Tratamiento');
  assert.equal(nullableNumber(null, 'duracion'), null);
  assert.equal(nullableNumber(90, 'duracion'), 90);
  assert.equal(finiteNumber(0, 'existencia'), 0);
  rejectsInvalid(text, [null, undefined, 12, {}]);
  rejectsInvalid(nullableText, [undefined, 12, {}]);
  rejectsInvalid(finiteNumber, [NaN, Infinity, -Infinity, '1', null]);
  rejectsInvalid(nullableNumber, [undefined, NaN, Infinity, '10']);
});

test('validation keeps exact decimal money strings and validates numeric cent precision', () => {
  assert.equal(decimal('12345678901234567890.99', 'precio'), '12345678901234567890.99');
  assert.equal(decimal('150.00', 'precio'), '150.00');
  assert.equal(decimal(12.5, 'precio'), '12.5');
  assert.equal(decimal(0.29, 'precio'), '0.29');
  assert.equal(decimal(0, 'precio'), '0');
  rejectsInvalid(decimal, [null, undefined, '', 'NaN', 'Infinity', '12 pesos', '1,25', NaN, Infinity, 0.1 + 0.2, Number.MAX_SAFE_INTEGER]);
});

test('validation preserves calendar days without a timezone shift', () => {
  assert.equal(calendarDate(null, 'fecha'), null);
  assert.equal(calendarDate('2024-02-29', 'fecha'), '2024-02-29');
  assert.equal(calendarDate('2024-02-29T00:00:00.000Z', 'fecha'), '2024-02-29');
  rejectsInvalid(calendarDate, [undefined, '', '2023-02-29', '2024-02-30', '2024-13-01', '2024-00-01', '2024-02-00', '29/02/2024', '2024-02-29T23:00:00.000Z', '2024-02-29T00:00:00-06:00', 1709164800000]);
});

test('validation preserves the confirmed Float amount without imposing cent precision or rounding', () => {
  assert.equal(numericDecimal(1.005, 'servicio.precio'), '1.005');
  assert.equal(numericDecimal(0.1 + 0.2, 'servicio.precio'), '0.30000000000000004');
  assert.equal(numericDecimal(1e-7, 'servicio.precio'), '0.0000001');
  assert.equal(numericDecimal(-1e-7, 'servicio.precio'), '-0.0000001');
  assert.equal(numericDecimal(0, 'servicio.precio'), '0');
  rejectsInvalid(numericDecimal, [null, undefined, '12', NaN, Infinity, -Infinity, 1e20]);
});
