import { useState } from 'react';
import { localCalendarDay, monthDays, monthTitle, selectableDay, shiftMonth } from './calendar';
export function useCalendarViewModel(today: string, blocked: readonly string[]) {
  const [requestedMonth, setMonth] = useState(() => today.slice(0, 7));
  const month = requestedMonth < today.slice(0, 7) ? today.slice(0, 7) : requestedMonth;
  return { month, title: monthTitle(month), days: monthDays(month), canPrevious: month > today.slice(0, 7),
    previous: () => setMonth(shiftMonth(month, -1)), next: () => setMonth(shiftMonth(month, 1)),
    selectable: (day: string) => selectableDay(day, today, blocked) };
}
export { localCalendarDay };
