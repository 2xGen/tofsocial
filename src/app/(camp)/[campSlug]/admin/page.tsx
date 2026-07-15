'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { CampFeedEntry } from '@/types/camp';
import { CAMP_DAYS, SPECIAL_LABELS } from '@/types/camp';
import {
  deleteCampFeedEntry,
  getCampFeed,
  getCampPlayers,
} from '@/lib/camp-store';
import { useCamp } from '@/lib/camp-context';
import { useCampPoll } from '@/components/camp/CampLiveFeed';

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function entryLabel(entry: CampFeedEntry, nicknames: Record<string, string>): string {
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

function entryTypeLabel(entry: CampFeedEntry): string {
  if (entry.type === 'special') return 'Special badge';
  if (entry.type === 'challenge') return 'Uitdaging';
  return entry.targetType === 'group' ? 'Groep' : 'Speler';
}

export default function AdminPage() {
  const { campId, basePath } = useCamp();
  const [feed, setFeed] = useState<CampFeedEntry[]>([]);
  const [nicknames, setNicknames] = useState<Record<string, string>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const [feedData, players] = await Promise.all([
      getCampFeed(campId),
      getCampPlayers(campId),
    ]);
    setFeed(feedData);
    setNicknames(Object.fromEntries(players.map((p) => [p.id, p.nickname])));
  }, [campId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useCampPoll(refresh);

  async function handleDelete(entry: CampFeedEntry) {
    const label = entryLabel(entry, nicknames);
    if (
      !window.confirm(
        `Actie verwijderen?\n\n${label}\n+${entry.points} punten · ${entry.trainer}\n\nDit kan niet ongedaan worden gemaakt.`
      )
    ) {
      return;
    }

    setError('');
    setDeletingId(entry.id);
    try {
      await deleteCampFeedEntry(campId, entry.id);
      await refresh();
    } catch {
      setError('Verwijderen mislukt. Probeer het opnieuw.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-tof-teal">Beheer</p>
          <h1 className="text-2xl font-bold text-tof-navy">Admin</h1>
          <p className="mt-1 text-sm text-gray-600">
            Alle punten en badges. Verwijder een actie als er een fout is gemaakt.
          </p>
        </div>
        <Link href={basePath} className="text-sm font-semibold text-tof-teal hover:underline">
          Naar kampwand
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <div className="tof-card tof-card-body">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-bold text-tof-navy">Alle acties</h2>
          <span className="text-xs font-semibold text-gray-400">{feed.length} totaal</span>
        </div>

        {feed.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Nog geen acties geregistreerd.</p>
        ) : (
          <ul className="space-y-2">
            {feed.map((entry) => {
              const dayLabel = CAMP_DAYS.find((d) => d.id === entry.day)?.label ?? entry.day;
              const isDeleting = deletingId === entry.id;

              return (
                <li
                  key={entry.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-tof-navy/10 px-2 py-0.5 text-[10px] font-bold uppercase text-tof-navy">
                        {entryTypeLabel(entry)}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400">{dayLabel}</span>
                    </div>
                    <p className="mt-1 font-semibold text-tof-navy">
                      {entryLabel(entry, nicknames)}
                    </p>
                    {entry.description && (
                      <p className="mt-0.5 text-sm text-gray-500">{entry.description}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {entry.trainer} · {formatTime(entry.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="rounded-full bg-tof-teal px-2.5 py-1 text-sm font-black text-tof-navy">
                      +{entry.points}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry)}
                      disabled={isDeleting}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      {isDeleting ? 'Bezig…' : 'Verwijderen'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Trainer:{' '}
        <Link href={`${basePath}/trainer`} className="text-tof-teal hover:underline">
          {basePath}/trainer
        </Link>
        {' · '}
        Groepen:{' '}
        <Link href={`${basePath}/groepen`} className="text-tof-teal hover:underline">
          {basePath}/groepen
        </Link>
        {' · '}
        Media:{' '}
        <Link href={`${basePath}/media`} className="text-tof-teal hover:underline">
          {basePath}/media
        </Link>
        {' · '}
        Foto&apos;s:{' '}
        <Link href={`${basePath}/kampfotos`} className="text-tof-teal hover:underline">
          {basePath}/kampfotos
        </Link>
      </p>
    </div>
  );
}
