'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getClubActivities } from '@/lib/store';
import {
  getMockFeedActivities,
  getMockFeedTimestamps,
  MOCK_CLUB_NAME,
} from '@/lib/mock-feed';
import FeedItemCard, { DemoBanner } from '@/components/platform/FeedItemCard';
import QuickActions from '@/components/platform/QuickActions';
import ClubOverview from '@/components/platform/ClubOverview';
import ClubDashboard from '@/components/platform/ClubDashboard';
import SportTabs, { type SportFilter } from '@/components/platform/SportTabs';
import type { Activity } from '@/types';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Zojuist';
  if (mins < 60) return `${mins} min geleden`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} uur geleden`;
  return `${Math.floor(hours / 24)} dagen geleden`;
}

export default function VerenigingPage() {
  const { user, club } = useAuth();
  const isDemo = !user;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [sportFilter, setSportFilter] = useState<SportFilter>('all');

  useEffect(() => {
    if (isDemo) {
      setActivities(getMockFeedActivities());
    } else if (club) {
      setActivities(getClubActivities(club.id));
    }
  }, [club, isDemo]);

  const mockTimestamps = getMockFeedTimestamps();
  const clubName = isDemo ? MOCK_CLUB_NAME : club?.name ?? '';

  const counts = useMemo(
    () => ({
      all: activities.length,
      tennis: activities.filter((a) => a.sport === 'tennis').length,
      padel: activities.filter((a) => a.sport === 'padel').length,
    }),
    [activities]
  );

  const filtered = useMemo(
    () =>
      sportFilter === 'all'
        ? activities
        : activities.filter((a) => a.sport === sportFilter),
    [activities, sportFilter]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {isDemo && <DemoBanner />}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="section-badge mb-2 inline-block">Vereniging</span>
          <h1 className="text-2xl font-bold text-tof-navy">{clubName}</h1>
          <p className="mt-1 text-sm text-gray-600">
            Overzicht van activiteit en betrokkenheid op de club.
          </p>
        </div>
        <Link href="/log" className="btn-primary shrink-0 justify-center py-2.5 text-sm">
          Activiteit melden
        </Link>
      </div>

      <ClubDashboard sportFilter={sportFilter} />

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="order-2 lg:order-1 lg:sticky lg:top-24 lg:self-start">
          <ClubOverview />
        </aside>

        <div className="order-1 space-y-5 lg:order-2">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
              Snel melden
            </p>
            <QuickActions />
          </div>

          <SportTabs value={sportFilter} onChange={setSportFilter} counts={counts} />

          <div className="flex items-center justify-between">
            <h2 className="font-bold text-tof-navy">
              {sportFilter === 'all'
                ? 'Clubactiviteit'
                : sportFilter === 'tennis'
                  ? 'Tennisactiviteit'
                  : 'Padelactiviteit'}
            </h2>
            <span className="text-xs text-gray-500">{filtered.length} meldingen</span>
          </div>

          <ul className="space-y-3">
            {filtered.map((activity) => {
              const globalIndex = activities.findIndex((a) => a.id === activity.id);
              return (
                <FeedItemCard
                  key={activity.id}
                  activity={activity}
                  timestamp={
                    isDemo && globalIndex >= 0
                      ? mockTimestamps[globalIndex]
                      : timeAgo(activity.createdAt)
                  }
                  playerHref="/profiel"
                  showSportBadge={sportFilter === 'all'}
                />
              );
            })}
          </ul>

          {filtered.length === 0 && (
            <div className="tof-card tof-card-body text-center text-sm text-gray-500">
              Geen activiteit voor{' '}
              {sportFilter === 'tennis' ? 'tennis' : 'padel'} deze week.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
