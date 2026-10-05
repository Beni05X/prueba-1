import { Link } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';

export default function NotFoundScreen() {
  return (
    <Screen title="Página no encontrada" subtitle="No encontramos la página que buscas.">
      <Link href="/" replace asChild>
        <Button label="Volver al inicio" />
      </Link>
    </Screen>
  );
}
