'use client';

import CampMediaWall from '@/components/camp/CampMediaWall';

export default function KampfotosPage() {
  return (
    <div className="mx-auto max-w-md px-1">
      <header className="mb-8 text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-tof-teal">TOF Social</p>
        <h1 className="mt-1 text-2xl font-bold text-tof-navy md:text-3xl">Kampfoto&apos;s</h1>
        <p className="mt-2 text-sm text-gray-500">Tik op een foto om groter te bekijken</p>
      </header>

      <CampMediaWall layout="feed" />
    </div>
  );
}
