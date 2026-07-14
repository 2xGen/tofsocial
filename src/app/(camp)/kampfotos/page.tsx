'use client';

import Link from 'next/link';
import CampMediaWall from '@/components/camp/CampMediaWall';

export default function KampfotosPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-tof-teal">TOF Social</p>
          <h1 className="text-2xl font-bold text-tof-navy md:text-3xl">Kampfoto&apos;s</h1>
          <p className="mt-1 text-sm text-gray-600">
            Alle foto&apos;s van het kamp — ververst live.
          </p>
        </div>
        <Link href="/tof-kamp" className="text-sm font-semibold text-tof-teal hover:underline">
          Terug naar kampwand
        </Link>
      </div>

      <div className="tof-card tof-card-body">
        <CampMediaWall />
      </div>
    </div>
  );
}
