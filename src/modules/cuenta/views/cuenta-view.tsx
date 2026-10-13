import { useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components/ui/screen';
import { AutenticacionSeccionView } from '@/modules/auth/views/autenticacion-seccion-view';
import { MisCursosView } from '@/modules/cursos/views/mis-cursos-view';
import { ConfiguracionSeccionView } from '@/modules/configuracion/views/configuracion-seccion-view';
import type { DestinoCuenta } from '@/modules/cuenta/viewmodels/cuenta-state';
import { useCuentaViewModel } from '@/modules/cuenta/viewmodels/use-cuenta-view-model';
import { FavoritosView } from '@/modules/favoritos/views/favoritos-view';
import { InformacionView } from '@/modules/informacion/views/informacion-view';
import { NotificacionesView } from '@/modules/notificaciones/views/notificaciones-view';
import { EditarPerfilView } from '@/modules/perfil/views/editar-perfil-view';
import { ComprasView } from '@/modules/ventas/views/compras-view';
import { loginDestination } from '@/modules/auth/models/auth-navigation';

export default function CuentaView() {
  const { seccion, returnTo } = useLocalSearchParams<{ seccion: string; returnTo?: string | string[] }>();
  const { destino } = useCuentaViewModel(seccion);
  const backHref = destino.backHref === '/autenticacion' ? { pathname: '/autenticacion' as const, params: { returnTo: loginDestination(returnTo) } } : destino.backHref;
  return (
    <Screen title={destino.titulo} backHref={backHref} compactHeader>
      <ContenidoCuenta destino={destino} />
    </Screen>
  );
}

function ContenidoCuenta({ destino }: { destino: DestinoCuenta }) {
  switch (destino.modulo) {
    case 'ventas': return <ComprasView />;
    case 'cursos': return <MisCursosView />;
    case 'perfil': return <EditarPerfilView />;
    case 'autenticacion': return <AutenticacionSeccionView key={destino.seccion} seccion={destino.seccion} />;
    case 'configuracion': return <ConfiguracionSeccionView seccion={destino.seccion} />;
    case 'favoritos': return <FavoritosView />;
    case 'informacion': return <InformacionView seccion={destino.seccion} />;
    case 'notificaciones': return <NotificacionesView />;
    case 'vacia': return null;
  }
}
