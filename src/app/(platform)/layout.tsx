'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Building2,
  LogOut,
  PenLine,
  Swords,
  Trophy,
  User,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { DEMO_PAGES } from '@/lib/demo';
import { cn } from '@/lib/utils';

const LOGO_SRC =
  'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/public/TOF%20Sports/TOF%20logo%20wit.svg';

const navItems = [
  { href: '/verenigingen', label: 'Verenigingen', sub: 'Ranglijst', icon: Trophy, demo: true },
  { href: '/vereniging', label: 'Mijn vereniging', sub: 'Club & feed', icon: Building2, demo: true },
  { href: '/profiel', label: 'Mijn profiel', sub: 'Speler', icon: User, demo: true },
  { href: '/log', label: 'Melden', sub: 'Activiteit', icon: PenLine, demo: true },
  { href: '/spelers', label: 'Uitdagen', sub: 'Spelers', icon: Swords, demo: true },
];

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const { user, club, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDemo = !user && DEMO_PAGES.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !DEMO_PAGES.includes(pathname)) {
      router.replace('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFBEB]">
        <p className="text-sm text-gray-500">Laden...</p>
      </div>
    );
  }

  if (!user && !isDemo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFBEB]">
        <p className="text-sm text-gray-500">Laden...</p>
      </div>
    );
  }

  if (user && !user.clubId && user.role === 'player') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFBEB] px-4">
        <div className="tof-card max-w-md tof-card-body text-center">
          <p className="font-bold text-tof-navy">Wachten op goedkeuring</p>
          <p className="mt-2 text-sm text-gray-600">
            Je vereniging moet je aanvraag nog goedkeuren voordat je de feed kunt zien.
          </p>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="btn-secondary mt-6 inline-flex"
          >
            Uitloggen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBEB] via-white to-gray-50">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-tof-navy shadow-lg">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/vereniging" className="flex items-end gap-1.5">
            <Image src={LOGO_SRC} alt="TOF" width={100} height={32} className="h-8 w-auto" />
            <span className="pb-0.5 text-[10px] font-bold text-white md:text-xs">Social</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map(({ href, label, icon: Icon, demo }) => {
              if (!user && !demo) return null;
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    active ? 'bg-tof-teal text-tof-navy' : 'text-white/80 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            {isDemo ? (
              <>
                <span className="rounded-full bg-amber-400/20 px-3 py-1 text-xs font-bold text-amber-300">
                  Demo
                </span>
                <Link
                  href="/"
                  className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                >
                  Naar home
                </Link>
              </>
            ) : (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-bold text-white">{user?.name}</p>
                  <p className="text-xs text-white/60">{club?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Uitloggen"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-2 md:hidden">
          {navItems.map(({ href, label, demo }) => {
            if (!user && !demo) return null;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold',
                  pathname === href ? 'bg-tof-teal text-tof-navy' : 'text-white/80'
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <main className="container py-8">{children}</main>
    </div>
  );
}
