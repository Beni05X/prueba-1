import { SectionScreen } from '@/components/navigation/section-screen';
import { NavigationSections } from '@/constants/navigation';

export default function ProfileScreen() {
  return <SectionScreen title={NavigationSections.profile.title} />;
}
