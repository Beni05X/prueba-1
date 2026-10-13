import { useState } from 'react';
import { usePerfilViewModel } from './use-perfil-view-model';
import { HttpPerfilService } from '../services/perfil-service';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
const service = new HttpPerfilService();

export function useEditarPerfilViewModel() {
  const vm = usePerfilViewModel();
  const { sessionRevision } = useAuthSession();
  const [draft, setDraft] = useState<{ revision: number; nombre?: string; telefono?: string } | null>(null);
  const current = draft?.revision === sessionRevision ? draft : null;
  const nombre = current?.nombre ?? vm.perfil?.nombre ?? '';
  const telefono = current?.telefono ?? vm.perfil?.telefono ?? '';
  const cambiar = (field: 'nombre' | 'telefono', value: string) => setDraft({ ...current, revision: sessionRevision, [field]: value });
  return { ...vm, campos: { nombre, telefono, correo: vm.perfil?.correo ?? '' },
    cambiarNombre: (value: string) => cambiar('nombre', value), cambiarTelefono: (value: string) => cambiar('telefono', value),
    guardar: async () => { if (await vm.ejecutar(() => service.guardar(nombre, telefono), 'Perfil actualizado.')) setDraft(null); },
    puedeGuardar: !!vm.perfil && !!nombre.trim() && nombre.trim().length <= 200 && telefono.trim().length <= 30 && !vm.ocupado && !vm.cargando };
}
