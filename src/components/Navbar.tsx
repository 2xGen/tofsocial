'use client';

import Image from 'next/image';
import Link from 'next/link';

const LOGO_SRC =
  'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/public/TOF%20Sports/TOF%20logo%20wit.svg';

export default function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-tof-navy/95 backdrop-blur-md">
      <nav className="container flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="flex items-end gap-1.5">
          <Image
            src={LOGO_SRC}
            alt="TOF"
            width={120}
            height={40}
            className="h-8 w-auto md:h-10"
            priority
          />
          <span className="pb-0.5 text-[10px] font-bold tracking-wide text-white md:text-xs">
            Social
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="https://tofsports.nl/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/90 transition-colors hover:border-white/40 hover:bg-white/10 sm:inline-flex"
          >
            TOF Sports
          </a>
          <a
            href="#contact"
            className="rounded-full bg-gradient-to-r from-tof-teal to-tof-mint px-4 py-2 text-sm font-bold text-tof-navy transition-transform hover:scale-105 md:px-5 md:py-2.5"
          >
            Contact
          </a>
        </div>
      </nav>
    </header>
  );
}
