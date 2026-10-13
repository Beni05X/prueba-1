import { EmptyState, ErrorState, LoadingState } from './async-states';
import { StatusMessage } from './status-message';
export function ResourceStatus({ cargando, error, mensaje, recargar, empty = false, emptyTitle = 'No hay datos para mostrar' }: { cargando: boolean; error: string | null; mensaje?: string | null; recargar: () => Promise<void>; empty?: boolean; emptyTitle?: string }) {
  return <>{cargando ? <LoadingState /> : null}{error ? <ErrorState message={error} onRetry={recargar} /> : null}{mensaje ? <StatusMessage message={mensaje} tone="info" /> : null}{!cargando && !error && empty ? <EmptyState title={emptyTitle} /> : null}</>;
}
