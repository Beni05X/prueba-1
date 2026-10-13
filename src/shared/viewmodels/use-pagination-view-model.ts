import { useState } from 'react';
import { paginate } from './pagination';
export function usePaginationViewModel<T>(items: readonly T[], resetKey: string) {
  const [selection, setSelection] = useState({ resetKey, page: 1 });
  const requested = selection.resetKey === resetKey ? selection.page : 1;
  const data = paginate(items, requested);
  // Persist both query resets and clamps: a later increase cannot resurrect page 8.
  if (selection.resetKey !== resetKey || selection.page !== data.page) setSelection({ resetKey, page: data.page });
  return { ...data, previous: () => setSelection({ resetKey, page: Math.max(1, data.page - 1) }), next: () => setSelection({ resetKey, page: Math.min(data.pages, data.page + 1) }) };
}
