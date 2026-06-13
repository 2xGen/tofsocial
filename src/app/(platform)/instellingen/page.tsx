'use client';

import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getDemoSportFocus } from '@/lib/sport-focus';
import PlayerSportPreference from '@/components/platform/PlayerSportPreference';
import { DemoBanner } from '@/components/platform/FeedItemCard';

export default function InstellingenPage() {
  const { user, refresh } = useAuth();
  const isDemo = !user;
  const sportFocus = isDemo ? getDemoSportFocus() : user?.sportFocus ?? 'beide';

  return (
    <div className="mx-auto max-w-lg">
      {isDemo && <DemoBanner className="mb-6" />}

      <Link
        href="/profiel"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-tof-teal hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Terug naar profiel
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-tof-navy">Instellingen</h1>
        <p className="mt-1 text-sm text-gray-600">Persoonlijke voorkeuren voor je account.</p>
      </div>

      <PlayerSportPreference
        userId={user?.id}
        isDemo={isDemo}
        initialFocus={sportFocus}
        onUpdated={() => refresh()}
      />
    </div>
  );
}
