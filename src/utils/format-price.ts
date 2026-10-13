// Preserve the approved price presentation across the Views.
export function formatPrice(price: number | string | null): string {
  if (price === null) return 'Precio no disponible';
  if (typeof price === 'number') return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  // Decimal amounts received as text never pass through a floating point number.
  if (!/^-?\d+(?:\.\d+)?$/.test(price)) throw new Error('Importe decimal inválido.');
  const [integer, fraction] = price.split('.');
  const normalized = integer.replace(/^(-?)0+(?=\d)/, '$1');
  const grouped = normalized.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const significantFraction = fraction?.replace(/0+$/, '');
  return `$${grouped}${significantFraction ? '.' + significantFraction : ''}`;
}
