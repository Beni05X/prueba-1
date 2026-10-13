import { useMemo, useState } from 'react';
import * as Linking from 'expo-linking';
import { HttpInformacionService } from '../services/informacion-service';
import { LoadState } from '@/shared/viewmodels/load-state';
import { useLoadState } from '@/shared/viewmodels/use-load-state';
import { operationError } from '@/shared/viewmodels/session-resource';
const service = new HttpInformacionService();
class InformationResource extends LoadState<{ preguntas: readonly { id: string; pregunta: string; respuesta: string }[]; contacto: string | null }> {
  constructor(private readonly section: string) { super({ preguntas: [], contacto: null }, 'cargando'); }
  cargar = (signal?: AbortSignal) => this.load(async () => {
    try { return { preguntas: this.section === 'ayuda' ? await service.preguntas({ signal }) : [], contacto: await service.contacto({ signal }) }; }
    catch (error) { throw new Error(operationError(error).message); }
  });
}
export function useInformacionViewModel(section: string) {
  const vm = useMemo(() => new InformationResource(section), [section]);
  const { estado } = useLoadState(vm);
  const [busqueda, cambiarBusqueda] = useState('');
  const [errorEnlace, setErrorEnlace] = useState<string | null>(null);
  return { section, busqueda, cambiarBusqueda, contacto: estado.datos.contacto,
    preguntas: estado.datos.preguntas.filter((item) => (item.pregunta + ' ' + item.respuesta).toLocaleLowerCase().includes(busqueda.toLocaleLowerCase())),
    cargando: estado.estadoCarga === 'cargando', error: estado.error || errorEnlace, recargar: () => vm.cargar(),
    abrir: async (url: string) => { setErrorEnlace(null); try { await Linking.openURL(url); } catch { setErrorEnlace('No se pudo abrir el enlace. Intenta de nuevo.'); } } };
}
