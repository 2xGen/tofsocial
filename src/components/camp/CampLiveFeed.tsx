'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CampFeedEntry } from '@/types/camp';
import { CAMP_DAYS, SPECIAL_LABELS } from '@/types/camp';
import {
  computePlayerStats,
  getCampFeed,
  getCampPlayers,
  subscribeCampFeed,
  usesCampRealtime,
} from '@/lib/camp-store';
import { useCamp } from '@/lib/camp-context';
import { PlayerNameWithBadge } from '@/components/camp/PlayerHundredBadge';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return 'Zojuist';
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min geleden`;
  return `${Math.floor(mins / 60)} uur geleden`;
}

interface CampLiveFeedProps {
  limit?: number;
  compact?: boolean;
}

export default function CampLiveFeed({ limit = 20, compact }: CampLiveFeedProps) {
  const { campId } = useCamp();
  const [feed, setFeed] = useState<CampFeedEntry[]>([]);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [campTotalPoints, setCampTotalPoints] = useState<Record<string, number>>({});

  const refresh = useCallback(async () => {
    const [feedData, players, totalStats] = await Promise.all([
      getCampFeed(campId, limit),
      getCampPlayers(campId),
      computePlayerStats(campId),
    ]);
    setFeed(feedData);
    setNicknames(Object.fromEntries(players.map((p) => [p.id, p.nickname])));
    setCampTotalPoints(
      Object.fromEntries(totalStats.map((s) => [s.playerId, s.totalPoints]))
    );
  }, [campId, limit]);

  useEffect(() => {
    refresh();
    const unsubRealtime = subscribeCampFeed(campId, refresh);
    const pollId = usesCampRealtime() ? null : setInterval(refresh, 3000);
    return () => {
      unsubRealtime();
      if (pollId) clearInterval(pollId);
    };
  }, [campId, refresh]);

  function renderEntryTitle(entry: CampFeedEntry) {
    if (entry.type === 'special' && entry.specialCategory) {
      const name = entry.playerId ? (nicknames[entry.playerId] ?? '…') : '?';
      const total = entry.playerId ? (campTotalPoints[entry.playerId] ?? 0) : 0;
      return (
        <>
          <PlayerNameWithBadge name={name} totalPoints={total} /> ·{' '}
          {SPECIAL_LABELS[entry.specialCategory]}
        </>
      );
    }
    if (entry.targetType === 'group' && entry.groupId) {
      return entry.challengeName
        ? `Groep ${entry.groupId} · ${entry.challengeName}`
        : `Groep ${entry.groupId}`;
    }
    if (entry.playerId) {
      const name = nicknames[entry.playerId] ?? '…';
      const total = campTotalPoints[entry.playerId] ?? 0;
      if (entry.challengeName) {
        return (
          <>
            <PlayerNameWithBadge name={name} totalPoints={total} /> · {entry.challengeName}
          </>
        );
      }
      return <PlayerNameWithBadge name={name} totalPoints={total} />;
    }
    return entry.description || 'Punten';
  }

  if (feed.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        Zodra trainers punten delen, verschijnt het hier live op de kampwand.
      </p>
    );
  }

  return (
    <ul className={compact ? 'space-y-2' : 'space-y-3'}>
      {feed.map((entry) => {
        const dayLabel = CAMP_DAYS.find((d) => d.id === entry.day)?.label ?? entry.day;
        return (
          <li
            key={entry.id}
            className={`flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-white ${
              compact ? 'px-3 py-2' : 'px-4 py-3'
            }`}
          >
            <div className="min-w-0">
              <p className={`font-semibold text-tof-navy ${compact ? 'text-sm' : ''}`}>
                {renderEntryTitle(entry)}
              </p>
              {entry.description && (
                <p className="mt-0.5 truncate text-xs text-gray-500">{entry.description}</p>
              )}
              <p className="mt-1 text-[10px] text-gray-400">
                {entry.trainer} · {dayLabel} · {timeAgo(entry.createdAt)}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-tof-teal px-2.5 py-1 text-sm font-black text-tof-navy">
              +{entry.points}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function useCampPoll(onTick: () => void, intervalMs = 3000) {
  const { campId } = useCamp();

  useEffect(() => {
    onTick();
    const unsub = subscribeCampFeed(campId, onTick);
    const pollId = usesCampRealtime() ? null : setInterval(onTick, intervalMs);
    return () => {
      unsub();
      if (pollId) clearInterval(pollId);
    };
  }, [campId, onTick, intervalMs]);
}
