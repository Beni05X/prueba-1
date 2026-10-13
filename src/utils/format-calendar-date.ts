const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** The adapter has validated this calendar day. No timezone conversion is made. */
export function formatCalendarDate(date: string): string {
  const [year, month, day] = date.split('-');
  return `${Number(day)} ${months[Number(month) - 1]} ${year}`;
}
