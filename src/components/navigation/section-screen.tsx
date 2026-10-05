import { Link } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';

export function SectionScreen({ title }: { title: string }) {
  return (
    <Screen title={title} subtitle="Sección en preparación.">
      <Link href="/" dismissTo asChild>
        <Button label="Volver al inicio" variant="secondary" />
      </Link>
    </Screen>
  );
}
