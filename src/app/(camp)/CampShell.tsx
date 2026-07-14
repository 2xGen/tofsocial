'use client';

import Link from 'next/link';
import Image from 'next/image';

const LOGO_SRC =
  'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/public/TOF%20Sports/TOF%20logo%20wit.svg';

export default function CampShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFBEB] via-white to-gray-50">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-tof-navy shadow-lg">
        <div className="container flex h-14 items-center gap-4">
          <Link href="/tof-kamp" className="flex shrink-0 items-end gap-1.5">
            <Image src={LOGO_SRC} alt="TOF" width={80} height={28} className="h-7 w-auto" />
            <span className="pb-0.5 text-[10px] font-bold text-white">Social</span>
            <span className="hidden pb-0.5 text-[10px] font-medium text-white/50 sm:inline">
              · Tenniskamp
            </span>
          </Link>
        </div>
      </header>
      <main className="container py-6 md:py-8">{children}</main>
    </div>
  );
}
