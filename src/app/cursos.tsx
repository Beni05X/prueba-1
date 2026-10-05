import { SectionScreen } from '@/components/navigation/section-screen';
import { NavigationSections } from '@/constants/navigation';

export default function CoursesScreen() {
  return <SectionScreen title={NavigationSections.courses.title} />;
}
