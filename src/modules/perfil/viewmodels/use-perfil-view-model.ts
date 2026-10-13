import { useCallback } from 'react';
import { accesosPerfil } from './perfil-state';
import { HttpPerfilService } from '../services/perfil-service';
import { useSessionResource } from '@/shared/viewmodels/use-session-resource';
import { useAuthSession } from '@/modules/auth/viewmodels/auth-session-provider';
const service = new HttpPerfilService();

export function usePerfilViewModel() {
  const { session } = useAuthSession();
  const email = session?.user.email;
  const load = useCallback((signal?: AbortSignal) => service.obtener({ signal }, email), [email]);
  const vm = useSessionResource(load);
  return { ...vm, perfil: vm.datos, accesos: accesosPerfil };
}
