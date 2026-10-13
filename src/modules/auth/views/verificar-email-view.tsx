import { Screen } from '@/components/ui/screen';
import { AutenticacionSeccionView } from './autenticacion-seccion-view';

export default function VerificarEmailView() {
  return <Screen title="Verificar correo" backHref="/autenticacion" compactHeader><AutenticacionSeccionView seccion="verificar-email" /></Screen>;
}
