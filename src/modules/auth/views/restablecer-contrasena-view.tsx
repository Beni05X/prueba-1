import { Screen } from '@/components/ui/screen';
import { AutenticacionSeccionView } from './autenticacion-seccion-view';

export default function RestablecerContrasenaView() {
  return <Screen title="Restablecer contraseña" backHref="/autenticacion" compactHeader><AutenticacionSeccionView seccion="restablecer-contrasena" /></Screen>;
}
