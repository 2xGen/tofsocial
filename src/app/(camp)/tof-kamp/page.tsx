'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CAMP_DAYS,
  GROUP_NUMBERS,
  SPECIAL_LABELS,
  type CampDay,
  type CampPlayer,
  type SpecialCategory,
} from '@/types/camp';
import type { GroupDayStats, PlayerDayStats } from '@/lib/camp-store';
import {
  computeGroupStats,
  getCampPlayers,
  getCampStore,
  getPlayerOfDay,
  getTopBySpecial,
  getTopPlayers,
} from '@/lib/camp-store';
import CampLiveFeed, { useCampPoll } from '@/components/camp/CampLiveFeed';

type GroupView = '' | 'unassigned' | number;

export default function TofKampPage() {
  const [viewDay, setViewDay] = useState<CampDay>('ma');
  const [players, setPlayers] = useState<CampPlayer[]>([]);
  const [playerOfDay, setPlayerOfDay] = useState<PlayerDayStats | null>(null);
  const [topPlayers, setTopPlayers] = useState<PlayerDayStats[]>([]);
  const [groupStats, setGroupStats] = useState<GroupDayStats[]>([]);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [selectedGroupView, setSelectedGroupView] = useState<GroupView>('');
  const [specialTops, setSpecialTops] = useState<
    Record<SpecialCategory, { players: PlayerDayStats[]; groups: GroupDayStats[] }>
  >({
    fair_play: { players: [], groups: [] },
    respect: { players: [], groups: [] },
    samenwerking: { players: [], groups: [] },
    inzet: { players: [], groups: [] },
  });

  const playersByGroup = useMemo(() => {
    const map = new Map<number, CampPlayer[]>();
    for (const g of GROUP_NUMBERS) map.set(g, []);
    for (const p of players) {
      if (p.groupId) map.get(p.groupId)?.push(p);
    }
    for (const g of GROUP_NUMBERS) {
      map.get(g)!.sort((a, b) => a.nickname.localeCompare(b.nickname, 'nl'));
    }
    return map;
  }, [players]);

  const unassignedPlayers = useMemo(
    () =>
      players
        .filter((p) => !p.groupId)
        .sort((a, b) => a.nickname.localeCompare(b.nickname, 'nl')),
    [players]
  );

  const assignedCount = players.length - unassignedPlayers.length;

  const visibleGroupPlayers = useMemo(() => {
    if (selectedGroupView === 'unassigned') return unassignedPlayers;
    if (typeof selectedGroupView === 'number') return playersByGroup.get(selectedGroupView) ?? [];
    return [];
  }, [selectedGroupView, unassignedPlayers, playersByGroup]);

  const loadStats = useCallback(async () => {
    const [allPlayers, pod, top, groups] = await Promise.all([
      getCampPlayers(),
      getPlayerOfDay(viewDay),
      getTopPlayers(viewDay, 10),
      computeGroupStats(viewDay),
    ]);
    setPlayers(allPlayers);
    setPlayerOfDay(pod);
    setTopPlayers(top);
    setGroupStats(groups);

    const cats: SpecialCategory[] = ['fair_play', 'respect', 'samenwerking', 'inzet'];
    const specialData = await Promise.all(
      cats.map(async (cat) => {
        const playerRanks = await getTopBySpecial(cat, viewDay, 3);
        const topGroups = [...groups]
          .filter((g) => g.memberCount > 0)
          .sort((a, b) => b[cat] - a[cat])
          .slice(0, 3);
        return { cat, players: playerRanks, groups: topGroups };
      })
    );
    setSpecialTops(
      Object.fromEntries(
        specialData.map((s) => [s.cat, { players: s.players, groups: s.groups }])
      ) as typeof specialTops
    );
  }, [viewDay]);

  useEffect(() => {
    getCampStore().then((s) => setViewDay(s.activeDay));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useCampPoll(loadStats);

  const dayLabel = CAMP_DAYS.find((d) => d.id === viewDay)?.label ?? viewDay;
  const rankedGroups = groupStats.filter((g) => g.memberCount > 0);

  return (
    <div className="space-y-6">
      <div className="tof-card tof-card-body border border-tof-teal/15 bg-gradient-to-br from-amber-50/60 via-white to-teal-50/40">
        <p className="text-xs font-bold uppercase tracking-wider text-tof-teal">
          TOF Social dashboard
        </p>
        <h1 className="mt-2 text-2xl font-black leading-tight text-tof-navy md:text-3xl">
          Het leukste Tennis, Padel &amp; Fun kamp van Voorne aan Zee!
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
          Welkom op de kampwand. Volg live mee wie er scoort en wat er vandaag gebeurt op het
          kamp.
        </p>

        <div className="mt-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Dag</p>
          <div className="grid grid-cols-4 gap-1 rounded-xl bg-gray-100 p-1">
            {CAMP_DAYS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setViewDay(d.id)}
                className={`rounded-lg py-2.5 text-center text-xs font-bold transition-colors sm:text-sm ${
                  viewDay === d.id
                    ? 'bg-white text-tof-navy shadow-sm'
                    : 'text-gray-500 hover:text-tof-navy'
                }`}
              >
                <span className="sm:hidden">{d.label.slice(0, 2)}</span>
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {playerOfDay && (
        <div className="tof-card overflow-hidden p-0">
          <div className="bg-gradient-to-br from-tof-teal to-emerald-600 px-6 py-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
              Speler van de dag · {dayLabel}
            </p>
            <p className="mt-1 text-3xl font-black">{playerOfDay.nickname}</p>
            <p className="mt-1 text-sm text-white/80">
              {playerOfDay.totalPoints} punten
              {playerOfDay.groupId ? ` · Groep ${playerOfDay.groupId}` : ''}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tof-card tof-card-body">
          <h2 className="font-bold text-tof-navy">Dagscore spelers</h2>
          <p className="mt-1 text-xs text-gray-500">{dayLabel}</p>
          <ol className="mt-3 space-y-2">
            {topPlayers.length === 0 ? (
              <li className="text-sm text-gray-400">
                De eerste punten komen zo — veel sportplezier vandaag!
              </li>
            ) : (
              topPlayers.map((p, i) => (
                <li
                  key={p.playerId}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-black ${
                        i < 3 ? 'bg-tof-teal text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="font-semibold text-tof-navy">{p.nickname}</span>
                    {p.groupId && (
                      <span className="text-xs text-gray-400">Groep {p.groupId}</span>
                    )}
                  </span>
                  <span className="font-bold tabular-nums text-tof-navy">{p.totalPoints}</span>
                </li>
              ))
            )}
          </ol>
        </div>

        <div className="tof-card tof-card-body">
          <h2 className="font-bold text-tof-navy">Stand groepen</h2>
          <p className="mt-1 text-xs text-gray-500">Totaal punten per groep · {dayLabel}</p>
          <ol className="mt-3 space-y-2">
            {rankedGroups.length === 0 ? (
              <li className="text-sm text-gray-400">
                Zodra groepen zijn ingedeeld, verschijnt de stand hier.
              </li>
            ) : (
              rankedGroups.map((g, i) => (
                <li
                  key={g.groupId}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-tof-navy text-xs font-black text-white">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-tof-navy">Groep {g.groupId}</span>
                    <span className="text-xs text-gray-400">
                      {g.memberCount} speler{g.memberCount !== 1 ? 's' : ''}
                    </span>
                  </span>
                  <span className="font-bold tabular-nums text-tof-navy">{g.totalPoints}</span>
                </li>
              ))
            )}
          </ol>
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-bold text-tof-navy">Hoogtepunten van vandaag</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(['fair_play', 'respect', 'samenwerking', 'inzet'] as SpecialCategory[]).map(
            (cat) => {
              const { players: rankedPlayers, groups } = specialTops[cat];
              const hasData = rankedPlayers.length > 0 || groups.length > 0;
              return (
                <div key={cat} className="tof-card tof-card-body">
                  <h3 className="text-sm font-bold text-tof-navy">{SPECIAL_LABELS[cat]}</h3>
                  {!hasData ? (
                    <p className="mt-3 text-xs text-gray-400">Nog geen badges vandaag</p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {rankedPlayers.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">Spelers</p>
                          <ol className="mt-1 space-y-1">
                            {rankedPlayers.map((p, i) => (
                              <li key={p.playerId} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {i + 1}. {p.nickname}
                                </span>
                                <span className="font-bold tabular-nums text-tof-navy">
                                  {p[cat]}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                      {groups.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">Groepen</p>
                          <ol className="mt-1 space-y-1">
                            {groups.map((g, i) => (
                              <li key={g.groupId} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {i + 1}. Groep {g.groupId}
                                </span>
                                <span className="font-bold tabular-nums text-tof-navy">
                                  {g[cat]}
                                </span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>

      <div className="tof-card tof-card-body">
        <h2 className="font-bold text-tof-navy">Laatste van het kamp</h2>
        <p className="mt-1 text-sm text-gray-500">
          Live updates van trainers — ververst automatisch.
        </p>
        <div className="mt-4">
          <CampLiveFeed limit={15} />
        </div>
      </div>

      <div className="tof-card overflow-hidden p-0">
        <button
          type="button"
          onClick={() => setGroupsOpen((open) => !open)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50"
        >
          <div>
            <h2 className="font-bold text-tof-navy">Groepen &amp; spelers</h2>
            <p className="mt-0.5 text-sm text-gray-500">
              Bekijk in welke groep jouw kind speelt
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-2 text-sm text-gray-400">
            <span className="hidden text-xs font-semibold sm:inline">
              {assignedCount}/{players.length} ingedeeld
            </span>
            <span
              className={`inline-block text-tof-teal transition-transform ${groupsOpen ? 'rotate-180' : ''}`}
              aria-hidden
            >
              ▾
            </span>
          </span>
        </button>

        {groupsOpen && (
          <div className="border-t border-gray-100 px-5 py-4">
            <label className="mb-1.5 block text-sm font-semibold text-tof-navy">
              Kies een groep
            </label>
            <select
              value={selectedGroupView === '' ? '' : String(selectedGroupView)}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '') setSelectedGroupView('');
                else if (v === 'unassigned') setSelectedGroupView('unassigned');
                else setSelectedGroupView(parseInt(v, 10));
              }}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-tof-navy outline-none focus:border-tof-teal"
            >
              <option value="">Selecteer groep…</option>
              {GROUP_NUMBERS.map((g) => {
                const count = playersByGroup.get(g)?.length ?? 0;
                return (
                  <option key={g} value={g}>
                    Groep {g} ({count} speler{count !== 1 ? 's' : ''})
                  </option>
                );
              })}
              {unassignedPlayers.length > 0 && (
                <option value="unassigned">
                  Nog niet ingedeeld ({unassignedPlayers.length})
                </option>
              )}
            </select>

            {selectedGroupView !== '' && (
              <div className="mt-4">
                <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
                  {selectedGroupView === 'unassigned'
                    ? 'Spelers zonder groep'
                    : `Spelers in groep ${selectedGroupView}`}
                </p>
                {visibleGroupPlayers.length === 0 ? (
                  <p className="mt-2 text-sm text-gray-400">Nog geen spelers in deze groep.</p>
                ) : (
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {visibleGroupPlayers.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-lg bg-gray-50 px-2.5 py-1 text-xs font-semibold text-tof-navy"
                      >
                        {p.nickname}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
