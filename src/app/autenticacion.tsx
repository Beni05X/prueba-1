import { SectionScreen } from '@/components/navigation/section-screen';
import { NavigationSections } from '@/constants/navigation';

export default function AuthenticationScreen() {
  return <SectionScreen title={NavigationSections.authentication.title} />;
}
