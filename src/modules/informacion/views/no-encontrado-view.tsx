import { Link } from 'expo-router';

import { Button } from '@/components/ui/button';
import { useNoEncontradoViewModel } from '@/modules/informacion/viewmodels/use-no-encontrado-view-model';
import { Screen } from '@/components/ui/screen';

export default function NoEncontradoView() {
  const { pagina, inicioHref } = useNoEncontradoViewModel();
  return (
    <Screen title={pagina.titulo} subtitle={pagina.subtitulo}>
      <Link href={inicioHref} replace asChild>
        <Button label="Volver al inicio" />
      </Link>
    </Screen>
  );
}
