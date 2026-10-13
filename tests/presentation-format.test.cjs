const assert = require('node:assert/strict');
const { test } = require('node:test');
const { formatPrice } = require('@/utils/format-price');
const { formatCalendarDate } = require('@/utils/format-calendar-date');
const { calendarDate, decimal } = require('@/shared/adapters/validation');

test('money labels retain decimal-string precision beyond safe floating-point amounts', () => {
  assert.equal(formatPrice(decimal('12345678901234567890.99', 'precio')), '$12,345,678,901,234,567,890.99');
  assert.equal(formatPrice(decimal('1200.00', 'precio')), '$1,200');
  assert.equal(formatPrice(decimal('1200.10', 'precio')), '$1,200.1');
  assert.equal(formatPrice(decimal('0.29', 'precio')), '$0.29');
  assert.equal(formatPrice(decimal('12.005', 'precio')), '$12.005');
  assert.equal(formatPrice(null), 'Precio no disponible');
  assert.throws(() => formatPrice('12 pesos'));
});

test('calendar date labels retain the verified backend day on a device in Mexico City', () => {
  const originalTimezone = process.env.TZ;
  process.env.TZ = 'America/Mexico_City';
  try {
    assert.equal(formatCalendarDate(calendarDate('2026-10-07T00:00:00.000Z', 'fecha_inicio')), '7 octubre 2026');
    assert.equal(formatCalendarDate(calendarDate('2024-02-29', 'fecha_inicio')), '29 febrero 2024');
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ;
    else process.env.TZ = originalTimezone;
  }
});
