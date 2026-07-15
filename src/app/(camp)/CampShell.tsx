'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Images, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCamp } from '@/lib/camp-context';

const LOGO_SRC =
  'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/public/TOF%20Sports/TOF%20logo%20wit.svg';

export default function CampShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { basePath, shortLabel } = useCamp();

  const navItems = [
    { href: basePath, label: 'Kampwand', icon: Trophy },
    { href: `${basePath}/kampfotos`, label: "Kampfoto's", icon: Images },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBEB] via-white to-gray-50">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-tof-navy shadow-lg">
        <div className="container flex h-14 items-center justify-between gap-4">
          <Link href={basePath} className="flex shrink-0 items-end gap-1.5">
            <Image src={LOGO_SRC} alt="TOF" width={80} height={28} className="h-7 w-auto" />
            <span className="pb-0.5 text-[10px] font-bold text-white">Social</span>
            <span className="hidden pb-0.5 text-[10px] font-medium text-white/50 sm:inline">
              · {shortLabel}
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
                    active ? 'bg-tof-teal text-tof-navy' : 'text-white/80 hover:text-white'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="container py-6 md:py-8">{children}</main>
    </div>
  );
}
