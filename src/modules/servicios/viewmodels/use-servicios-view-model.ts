import { useMemo } from 'react';

import { HttpServiciosService, type ServiciosService } from '@/modules/servicios/services/servicios-service';
import { ServiciosViewModel } from './servicios-view-model';
import { formatPrice } from '@/utils/format-price';
import { useLoadState } from '@/shared/viewmodels/use-load-state';

const defaultService: ServiciosService = new HttpServiciosService();

export function useServiciosViewModel(id?: string, service: ServiciosService = defaultService) {
  const viewModel = useMemo(() => new ServiciosViewModel(service, id), [service, id]);
  const { estado, tipoError } = useLoadState(viewModel);
  const servicio = estado.datos;

  return {
    estado,
    servicio,
    cargando: estado.estadoCarga === 'cargando',
    error: estado.error,
    tipoError,
    precio: servicio ? formatPrice(servicio.precio) : '',
    duracion: servicio?.duracionTexto ? `Duración · ${servicio.duracionTexto}` : servicio?.duracionMinutos != null ? `Duración · ${servicio.duracionMinutos} min` : undefined,
    incluye: servicio?.incluye?.map((item) => `✓ ${item}`).join('  '),
    recargar: () => viewModel.cargar(),
  };
}
