import { useCallback, useState } from 'react';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { useTransferenciaViewModel } from '@/shared/viewmodels/use-transferencia-view-model';
import { HttpInscripcionesService } from '../services/inscripciones-service';
import type { Curso } from '../models/curso';
import type { InscripcionCreada } from '../models/inscripcion';
import { formatPrice } from '@/utils/format-price';
const service = new HttpInscripcionesService();
export function useInscripcionViewModel(curso: Curso) {
  const { session, sessionRevision } = useAuthSession();
  const scope = sessionRevision + ':' + curso.id;
  const [receipt, setReceipt] = useState<{ scope: string; inscripcion: InscripcionCreada } | null>(null);
  const vm = useSessionResource(useCallback((signal?: AbortSignal) => service.listar({ signal }), []));
  const transferencia = useTransferenciaViewModel();
  const inscripcion = receipt?.scope === scope ? receipt.inscripcion : null;
  const inscrito = !!inscripcion || (vm.datos?.some((item) => item.cursoId === curso.id && item.estado === 'ACTIVO') ?? false);
  const permitido = !session?.user.role || session.user.role === 'CLIENTE';
  const sinCupo = curso.cupoMaximo != null && curso.inscritos != null && curso.inscritos >= curso.cupoMaximo;
  const puedeInscribir = !inscrito && permitido && !sinCupo && !vm.ocupado && !vm.cargando && !vm.error && !!vm.datos && !!transferencia.datos && !transferencia.cargando && !transferencia.error;
  return { ...vm, transferencia, inscripcion, inscrito, permitido, sinCupo, puedeInscribir,
    inscribir: () => puedeInscribir ? vm.ejecutar(() => service.inscribir(curso.id),
      (item) => 'Inscripción #' + item.inscripcionId + ' registrada. Pago #' + item.pagoId + ' por transferencia pendiente: ' + formatPrice(item.monto) + '.',
      (item) => setReceipt({ scope, inscripcion: item })) : Promise.resolve(false) };
}
