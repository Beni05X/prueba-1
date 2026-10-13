import { useMemo } from 'react';

import { HttpCursosService, type CursosService } from '@/modules/cursos/services/cursos-service';
import { CursosViewModel } from './cursos-view-model';
import { formatPrice } from '@/utils/format-price';
import { formatCalendarDate } from '@/utils/format-calendar-date';
import { useLoadState } from '@/shared/viewmodels/use-load-state';

const defaultService: CursosService = new HttpCursosService();

export function useCursosViewModel(id?: string, service: CursosService = defaultService) {
  const viewModel = useMemo(() => new CursosViewModel(service, id), [service, id]);
  const { estado, tipoError } = useLoadState(viewModel);
  const curso = estado.datos;

  return {
    estado,
    curso,
    cargando: estado.estadoCarga === 'cargando',
    error: estado.error,
    tipoError,
    informacion: curso ? [
      ...(curso.instructor ? [{ label: 'Instructor', value: curso.instructor }] : []),
      ...(curso.duracionHoras != null ? [{ label: 'Duración', value: `${curso.duracionHoras} horas` }] : []),
      ...(curso.modalidad ? [{ label: 'Modalidad', value: curso.modalidad }] : []),
      ...(curso.inicioTexto || curso.fechaInicio ? [{ label: 'Inicio', value: curso.inicioTexto ?? formatCalendarDate(curso.fechaInicio!) }] : []),
    ] : [],
    precio: curso ? formatPrice(curso.precio) : '',
    recargar: () => viewModel.cargar(),
  };
}
