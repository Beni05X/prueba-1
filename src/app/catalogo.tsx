import { SectionScreen } from '@/components/navigation/section-screen';
import { NavigationSections } from '@/constants/navigation';

export default function CatalogScreen() {
  return <SectionScreen title={NavigationSections.catalog.title} />;
}
