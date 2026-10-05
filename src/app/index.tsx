import { Link } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { NavigationSections } from '@/constants/navigation';

export default function IndexScreen() {
  return (
    <Screen title="Salón Brenn's" subtitle="Selecciona una sección.">
      <ThemedView surface="card">
        {Object.values(NavigationSections).map((section) => (
          <Link key={section.name} href={section.href} asChild>
            <Button label={section.title} variant="secondary" />
          </Link>
        ))}
      </ThemedView>
    </Screen>
  );
}
