'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CampFeedEntry } from '@/types/camp';
import { CAMP_DAYS, SPECIAL_LABELS } from '@/types/camp';
import {
  getCampFeed,
  getCampPlayers,
  subscribeCampFeed,
  usesSupabase,
} from '@/lib/camp-store';

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
  const [feed, setFeed] = useState<CampFeedEntry[]>([]);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});

  const refresh = useCallback(async () => {
    const [feedData, players] = await Promise.all([getCampFeed(limit), getCampPlayers()]);
    setFeed(feedData);
    setNicknames(Object.fromEntries(players.map((p) => [p.id, p.nickname])));
  }, [limit]);

  useEffect(() => {
    refresh();
    const unsubRealtime = subscribeCampFeed(refresh);
    const pollId = usesSupabase() ? null : setInterval(refresh, 3000);
    return () => {
      unsubRealtime();
      if (pollId) clearInterval(pollId);
    };
  }, [refresh]);

  function formatEntry(entry: CampFeedEntry): string {
    if (entry.type === 'special' && entry.specialCategory) {
      const name = entry.playerId ? (nicknames[entry.playerId] ?? '…') : '?';
      return `${name} · ${SPECIAL_LABELS[entry.specialCategory]}`;
    }
    if (entry.targetType === 'group' && entry.groupId) {
      return entry.challengeName
        ? `Groep ${entry.groupId} · ${entry.challengeName}`
        : `Groep ${entry.groupId}`;
    }
    if (entry.playerId) {
      const name = nicknames[entry.playerId] ?? '…';
      return entry.challengeName ? `${name} · ${entry.challengeName}` : name;
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
                {formatEntry(entry)}
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
  useEffect(() => {
    onTick();
    const unsub = subscribeCampFeed(onTick);
    const pollId = usesSupabase() ? null : setInterval(onTick, intervalMs);
    return () => {
      unsub();
      if (pollId) clearInterval(pollId);
    };
  }, [onTick, intervalMs]);
}
