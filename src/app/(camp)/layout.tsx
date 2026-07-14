import type { Metadata } from 'next';
import CampShell from './CampShell';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function CampLayout({ children }: { children: React.ReactNode }) {
  return <CampShell>{children}</CampShell>;
}
