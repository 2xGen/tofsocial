'use client';

import Link from 'next/link';
import { Settings } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getClubActivities, getUserWeeklyPoints } from '@/lib/store';
import {
  getMockFeedActivities,
  getMockFeedTimestamps,
  MOCK_CLUB_NAME,
} from '@/lib/mock-feed';
import { DEMO_PLAYER } from '@/lib/demo';
import { getDemoSportFocus } from '@/lib/sport-focus';
import FeedItemCard, { DemoBanner } from '@/components/platform/FeedItemCard';
import PlayerScoreCard from '@/components/platform/PlayerScoreCard';
import StreakWidget from '@/components/platform/StreakWidget';
import SportTabs, { type SportFilter } from '@/components/platform/SportTabs';
import { PointsLegend } from '@/components/platform/QuickActions';
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

export default function ProfielPage() {
  const { user, club } = useAuth();
  const isDemo = !user;
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activityFilter, setActivityFilter] = useState<SportFilter>('all');

  const sportFocus = isDemo ? getDemoSportFocus() : user?.sportFocus ?? 'beide';

  const playerName = isDemo ? DEMO_PLAYER.name : user?.name ?? '';
  const clubName = isDemo ? MOCK_CLUB_NAME : club?.name ?? '';
  const weeklyPoints = isDemo
    ? DEMO_PLAYER.weeklyPoints
    : user
      ? getUserWeeklyPoints(user.id)
      : 0;

  const lastActivityAt = isDemo
    ? new Date(Date.now() - 2 * 60 * 1000).toISOString()
    : new Date().toISOString();

  useEffect(() => {
    const all = isDemo
      ? getMockFeedActivities()
      : club
        ? getClubActivities(club.id)
        : [];
    setActivities(all.filter((a) => a.userName === playerName));
  }, [club, isDemo, playerName]);

  const mockTimestamps = getMockFeedTimestamps();
  const allMock = getMockFeedActivities();
  const timestampFor = (activity: Activity, index: number) => {
    if (!isDemo) return timeAgo(activity.createdAt);
    const globalIndex = allMock.findIndex((a) => a.id === activity.id);
    return mockTimestamps[globalIndex >= 0 ? globalIndex : index];
  };

  const showActivityFilter = sportFocus === 'beide';

  const filteredActivities = useMemo(() => {
    if (!showActivityFilter || activityFilter === 'all') return activities;
    return activities.filter((a) => a.sport === activityFilter);
  }, [activities, activityFilter, showActivityFilter]);

  const activityCounts = useMemo(
    () => ({
      all: activities.length,
      tennis: activities.filter((a) => a.sport === 'tennis').length,
      padel: activities.filter((a) => a.sport === 'padel').length,
    }),
    [activities]
  );

  return (
    <div className="mx-auto max-w-3xl">
      {isDemo && <DemoBanner className="mb-6" />}

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <span className="section-badge mb-2 inline-block">Spelerprofiel</span>
          <h1 className="text-2xl font-bold text-tof-navy">Mijn profiel</h1>
          <p className="mt-1 text-sm text-gray-600">
            Jouw punten, reeks en activiteiten — apart van het cluboverzicht.
          </p>
        </div>
        <Link
          href="/instellingen"
          className="btn-secondary shrink-0 gap-2 px-4 py-2.5 text-sm"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Instellingen</span>
        </Link>
      </div>

      <div className="space-y-5">
        <PlayerScoreCard
          name={playerName}
          clubName={clubName}
          weeklyPoints={weeklyPoints}
          rank={isDemo ? DEMO_PLAYER.rank : undefined}
          streak={isDemo ? DEMO_PLAYER.streak : undefined}
        />

        <StreakWidget streakDays={isDemo ? DEMO_PLAYER.streak : 3} lastActivityAt={lastActivityAt} />

        <div className="flex gap-3">
          <Link href="/log" className="btn-primary flex-1 justify-center py-3 text-sm">
            Activiteit melden
          </Link>
          <Link href="/spelers" className="btn-secondary flex-1 justify-center py-3 text-sm">
            Speler uitdagen
          </Link>
        </div>

        <PointsLegend />

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-tof-navy">Mijn activiteiten</h2>
            <Link href="/vereniging" className="text-sm font-semibold text-tof-teal hover:underline">
              Alle clubactiviteit →
            </Link>
          </div>

          {showActivityFilter && activities.length > 0 && (
            <div className="mb-4">
              <SportTabs
                value={activityFilter}
                onChange={setActivityFilter}
                counts={activityCounts}
              />
            </div>
          )}

          {filteredActivities.length === 0 ? (
            <div className="tof-card tof-card-body text-center text-sm text-gray-500">
              Nog geen activiteiten.{' '}
              <Link href="/log" className="font-semibold text-tof-teal">
                Meld je eerste activiteit
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredActivities.map((activity, index) => (
                <FeedItemCard
                  key={activity.id}
                  activity={activity}
                  timestamp={timestampFor(activity, index)}
                  showSportBadge={showActivityFilter && activityFilter === 'all'}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
