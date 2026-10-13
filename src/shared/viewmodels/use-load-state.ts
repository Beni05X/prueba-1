import { useEffect, useSyncExternalStore } from 'react';

import type { LoadState } from './load-state';

export function useLoadState<T>(viewModel: LoadState<T> & { cargar(signal?: AbortSignal): Promise<void> }) {
  const estado = useSyncExternalStore(viewModel.subscribe, viewModel.getSnapshot, viewModel.getSnapshot);
  useEffect(() => {
    const controller = new AbortController();
    void viewModel.cargar(controller.signal);
    return () => {
      viewModel.cancel();
      controller.abort();
    };
  }, [viewModel]);
  return { estado, tipoError: viewModel.getErrorType() };
}
