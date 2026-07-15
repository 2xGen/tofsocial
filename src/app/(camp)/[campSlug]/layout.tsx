import { notFound } from 'next/navigation';
import { getCampBySlug, isCampSlug } from '@/lib/camp-config';
import { CampProvider } from '@/lib/camp-context';
import CampShell from '../CampShell';

export default function CampSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { campSlug: string };
}) {
  const { campSlug } = params;
  if (!isCampSlug(campSlug)) notFound();
  const camp = getCampBySlug(campSlug);
  if (!camp) notFound();

  return (
    <CampProvider camp={camp}>
      <CampShell>{children}</CampShell>
    </CampProvider>
  );
}
