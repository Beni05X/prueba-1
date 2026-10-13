import { useCallback, useState } from 'react';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
import { useTransferenciaViewModel } from '@/shared/viewmodels/use-transferencia-view-model';
import { importeReserva } from '@/shared/adapters/transferencia-adapter';
import { useCalendarViewModel } from '@/shared/viewmodels/use-calendar-view-model';
import { localCalendarDay, selectableDay } from '@/shared/viewmodels/calendar';
import { useCurrentTime } from '@/shared/viewmodels/use-current-time';
import type { Servicio } from '@/modules/servicios/models/servicio';
import { HttpAgendaService } from '../services/agenda-service';
import type { Disponibilidad, ReservaCreada } from '../models/cita';
import { reservarConDisponibilidad } from './reserva-actions';
const service = new HttpAgendaService();
type Draft = { scope: string; fecha: string; hora: string | null; tipoPago: 'ANTICIPO' | 'COMPLETO' };
export function useReservaViewModel(servicio: Servicio, empleadoId?: string) {
  const { sessionRevision } = useAuthSession();
  const scope = sessionRevision + ':' + servicio.id + ':' + (empleadoId ?? '');
  const today = localCalendarDay(new Date(useCurrentTime()));
  const [draft, setDraft] = useState<Draft | null>(null);
  const [receipt, setReceipt] = useState<{ scope: string; cita: ReservaCreada; fecha: string; hora: string; tipoPago: 'ANTICIPO' | 'COMPLETO'; importe: string } | null>(null);
  const [conflict, setConflict] = useState<{ scope: string; message: string } | null>(null);
  if (draft && draft.scope !== scope) setDraft(null);
  if (receipt && receipt.scope !== scope) setReceipt(null);
  if (conflict && conflict.scope !== scope) setConflict(null);
  const current = draft?.scope === scope ? draft : null;
  const fecha = current?.fecha ?? '', hora = current?.hora ?? null, tipoPago = current?.tipoPago ?? 'COMPLETO';
  const dias = useSessionResource(useCallback((signal?: AbortSignal) => service.diasBloqueados({ signal }), []));
  const transferencia = useTransferenciaViewModel();
  const calendar = useCalendarViewModel(today, dias.datos ?? []);
  const fechaValida = !!dias.datos && !dias.cargando && !dias.error && selectableDay(fecha, today, dias.datos);
  const load = useCallback((signal?: AbortSignal): Promise<Disponibilidad | null> => fechaValida ? service.horarios(servicio.id, fecha, { signal }, empleadoId) : Promise.resolve(null), [servicio.id, fecha, empleadoId, fechaValida]);
  const vm = useSessionResource(load);
  const horarios = !vm.cargando && !vm.error && fechaValida && !vm.datos?.sinAtencion ? vm.datos?.horarios.filter((slot) => slot.disponible) ?? [] : [];
  const selected = horarios.some((slot) => slot.hora === hora);
  const cita = receipt?.scope === scope ? receipt.cita : null;
  const importe = receipt?.scope === scope ? receipt.importe : transferencia.datos ? importeReserva(servicio.precio, tipoPago, transferencia.datos.anticipoPorcentaje) : null;
  const puedeReservar = selected && !vm.ocupado && !vm.cargando && !cita && !!importe && !transferencia.cargando && !transferencia.error;
  const change = (value: Partial<Draft>) => { if (!vm.ocupado) setDraft({ scope, fecha, hora, tipoPago, ...value }); };
  return { ...vm, dias, transferencia, calendar, fecha, hora: receipt?.scope === scope ? receipt.hora : selected ? hora : null, tipoPago, importe, cita, horarios,
    conflicto: conflict?.scope === scope ? conflict.message : null,
    consultado: fechaValida && vm.datos !== null, sinAtencion: !!vm.datos?.sinAtencion,
    cambiarFecha: (next: string) => { if (dias.datos && selectableDay(next, today, dias.datos)) { change({ fecha: next, hora: null }); setConflict(null); } },
    cambiarHora: (next: string) => { if (horarios.some((slot) => slot.hora === next)) { change({ hora: next }); setConflict(null); } },
    cambiarTipoPago: (next: string) => { if (next === 'ANTICIPO' || next === 'COMPLETO') change({ tipoPago: next }); },
    puedeReservar,
    reservar: () => puedeReservar && hora && importe ? vm.ejecutar(
      () => reservarConDisponibilidad(() => service.reservar(servicio.id, fecha, hora, importe, empleadoId), async () => { await Promise.all([vm.recargar(), dias.recargar()]); }, () => { setDraft((previous) => previous?.scope === scope && previous.fecha === fecha ? { ...previous, hora: null } : previous); setConflict({ scope, message: 'La disponibilidad cambió. Selecciona otra fecha u hora antes de confirmar.' }); }),
      (result) => 'Cita #' + result.id + ' registrada. El pago por transferencia está pendiente.',
      (result) => setReceipt({ scope, cita: result, fecha, hora, tipoPago, importe })) : Promise.resolve(false),
  };
}
