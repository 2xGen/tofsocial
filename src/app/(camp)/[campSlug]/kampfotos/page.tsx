'use client';

import CampMediaWall from '@/components/camp/CampMediaWall';
import { useCamp } from '@/lib/camp-context';

export default function KampfotosPage() {
  const { campId, name } = useCamp();

  return (
    <div className="mx-auto max-w-md px-1">
      <header className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-tof-teal">
          {campId === 'tof' ? 'TOF Social' : name}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-tof-navy md:text-3xl">Kampfoto&apos;s</h1>
        <p className="mt-2 text-sm text-gray-500">Tik op een foto om groter te bekijken</p>
      </header>

      <CampMediaWall layout="feed" />
    </div>
  );
}
