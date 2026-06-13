import Link from 'next/link';
import type { Activity } from '@/types';
import { ACTIVITY_LABELS } from '@/types';
import { ACTIVITY_ICON } from '@/lib/demo';
import { ActivityIcon } from '@/lib/icons';
import PlayerAvatar from './PlayerAvatar';

interface FeedItemCardProps {
  activity: Activity;
  timestamp: string;
  playerHref?: string;
  showSportBadge?: boolean;
}

export default function FeedItemCard({
  activity,
  timestamp,
  playerHref,
  showSportBadge = true,
}: FeedItemCardProps) {
  const icon = ACTIVITY_ICON[activity.type];

  const nameEl = playerHref ? (
    <Link href={playerHref} className="font-bold text-tof-navy hover:text-tof-teal hover:underline">
      {activity.userName}
    </Link>
  ) : (
    <span className="font-bold text-tof-navy">{activity.userName}</span>
  );

  return (
    <li className="tof-card overflow-hidden p-0 transition-shadow hover:shadow-md">
      <div className="flex items-stretch gap-0">
        <div className="w-1 shrink-0 bg-tof-teal" aria-hidden />
        <div className="flex flex-1 items-start gap-3 p-4">
          <div className="relative shrink-0">
            {playerHref ? (
              <Link href={playerHref}>
                <PlayerAvatar name={activity.userName} />
              </Link>
            ) : (
              <PlayerAvatar name={activity.userName} />
            )}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-gray-100">
              <ActivityIcon name={icon} className="text-tof-navy" size={11} />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug text-gray-900">
              {nameEl}{' '}
              <span className="text-gray-600">{activity.description}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {showSportBadge && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                    activity.sport === 'padel'
                      ? 'bg-violet-100 text-violet-700'
                      : 'bg-sky-100 text-sky-700'
                  }`}
                >
                  {activity.sport}
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                {ACTIVITY_LABELS[activity.type]}
              </span>
              <time className="text-xs text-gray-400">{timestamp}</time>
            </div>
          </div>

          <span className="shrink-0 self-center rounded-full bg-tof-teal px-3 py-1.5 text-sm font-black text-tof-navy">
            +{activity.points}
          </span>
        </div>
      </div>
    </li>
  );
}

interface DemoBannerProps {
  className?: string;
}

export function DemoBanner({ className }: DemoBannerProps) {
  return (
    <div
      className={`rounded-2xl border border-tof-teal/30 bg-gradient-to-r from-tof-teal/15 to-tof-mint/20 px-5 py-4 ${className ?? ''}`}
    >
      <p className="text-sm font-semibold text-tof-navy">Demo-modus</p>
      <p className="mt-1 text-sm text-gray-600">Verken de app visueel.</p>
    </div>
  );
}
