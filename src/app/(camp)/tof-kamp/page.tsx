'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CAMP_DAYS,
  GROUP_NUMBERS,
  SPECIAL_LABELS,
  groupDisplayName,
  formatGroupLabel,
  type CampPlayer,
  type SpecialCategory,
  type ViewPeriod,
} from '@/types/camp';
import type { GroupDayStats, PlayerDayStats } from '@/lib/camp-store';
import {
  computeGroupStats,
  computePlayerStats,
  getCampGroupNames,
  getCampPlayers,
  getCampStore,
  getPlayerOfDay,
  getTopBySpecial,
  getTopPlayers,
} from '@/lib/camp-store';
import CampLiveFeed, { useCampPoll } from '@/components/camp/CampLiveFeed';
import CampMediaWall from '@/components/camp/CampMediaWall';
import { PlayerNameWithBadge } from '@/components/camp/PlayerHundredBadge';
import Link from 'next/link';

type GroupView = '' | 'unassigned' | number;

export default function TofKampPage() {
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('ma');
  const [players, setPlayers] = useState<CampPlayer[]>([]);
  const [playerOfDay, setPlayerOfDay] = useState<PlayerDayStats | null>(null);
  const [topPlayers, setTopPlayers] = useState<PlayerDayStats[]>([]);
  const [groupStats, setGroupStats] = useState<GroupDayStats[]>([]);
  const [groupNames, setGroupNames] = useState<Record<number, string>>({});
  const [allPlayerStats, setAllPlayerStats] = useState<PlayerDayStats[]>([]);
  const [campTotalPoints, setCampTotalPoints] = useState<Record<string, number>>({});
  const [playerLookup, setPlayerLookup] = useState('');
  const [selectedLookupId, setSelectedLookupId] = useState<string | null>(null);
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

  const lookupResults = useMemo(() => {
    const q = playerLookup.trim().toLowerCase();
    if (!q) return [];
    return allPlayerStats
      .filter((s) => {
        const p = players.find((x) => x.id === s.playerId);
        return (
          s.nickname.toLowerCase().includes(q) ||
          (p?.fullName.toLowerCase().includes(q) ?? false)
        );
      })
      .slice(0, 8);
  }, [playerLookup, allPlayerStats, players]);

  const lookedUpPlayer = useMemo(() => {
    if (!selectedLookupId) return null;
    return allPlayerStats.find((s) => s.playerId === selectedLookupId) ?? null;
  }, [selectedLookupId, allPlayerStats]);

  const lookedUpRank = useMemo(() => {
    if (!lookedUpPlayer) return null;
    const ranked = [...allPlayerStats]
      .filter((s) => s.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints);
    const idx = ranked.findIndex((s) => s.playerId === lookedUpPlayer.playerId);
    return idx >= 0 ? idx + 1 : null;
  }, [lookedUpPlayer, allPlayerStats]);

  const loadStats = useCallback(async () => {
    const periodDay = viewPeriod === 'totaal' ? undefined : viewPeriod;
    const [allPlayers, pod, top, groups, names, periodStats, totalStats] = await Promise.all([
      getCampPlayers(),
      getPlayerOfDay(periodDay),
      getTopPlayers(periodDay, 10),
      computeGroupStats(periodDay),
      getCampGroupNames(),
      computePlayerStats(periodDay),
      computePlayerStats(),
    ]);
    setPlayers(allPlayers);
    setPlayerOfDay(pod);
    setTopPlayers(top);
    setGroupStats(groups);
    setGroupNames(names);
    setAllPlayerStats(periodStats);
    setCampTotalPoints(
      Object.fromEntries(totalStats.map((s) => [s.playerId, s.totalPoints]))
    );

    const cats: SpecialCategory[] = ['fair_play', 'respect', 'samenwerking', 'inzet'];
    const specialData = await Promise.all(
      cats.map(async (cat) => {
        const playerRanks = await getTopBySpecial(cat, periodDay, 3);
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
  }, [viewPeriod]);

  useEffect(() => {
    getCampStore().then((s) => setViewPeriod(s.activeDay));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useCampPoll(loadStats);

  const periodLabel =
    viewPeriod === 'totaal'
      ? 'Totaal kamp'
      : (CAMP_DAYS.find((d) => d.id === viewPeriod)?.label ?? viewPeriod);
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Periode
          </p>
          <div className="grid grid-cols-5 gap-1 rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setViewPeriod('totaal')}
              className={`rounded-lg py-2.5 text-center text-xs font-bold transition-colors sm:text-sm ${
                viewPeriod === 'totaal'
                  ? 'bg-white text-tof-navy shadow-sm'
                  : 'text-gray-500 hover:text-tof-navy'
              }`}
            >
              Totaal
            </button>
            {CAMP_DAYS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setViewPeriod(d.id)}
                className={`rounded-lg py-2.5 text-center text-xs font-bold transition-colors sm:text-sm ${
                  viewPeriod === d.id
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

      <div className="tof-card tof-card-body">
        <h2 className="font-bold text-tof-navy">Zoek jouw speler</h2>
        <p className="mt-1 text-sm text-gray-500">
          Typ een naam om de score te zien · {periodLabel}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Badge met honderdtal = button halen bij begeleider (totaal punten kamp)
        </p>
        <div className="mt-3">
          <input
            type="search"
            value={playerLookup}
            onChange={(e) => {
              setPlayerLookup(e.target.value);
              setSelectedLookupId(null);
            }}
            placeholder="bijv. Enzo, Sanne, Arthur…"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          />
          {playerLookup.trim() && lookupResults.length > 0 && !selectedLookupId && (
            <ul className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-sm">
              {lookupResults.map((s) => (
                <li key={s.playerId}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLookupId(s.playerId);
                      setPlayerLookup(s.nickname);
                    }}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-gray-50"
                  >
                    <PlayerNameWithBadge
                      name={s.nickname}
                      totalPoints={campTotalPoints[s.playerId] ?? 0}
                      nameClassName="font-semibold text-tof-navy"
                    />
                    <span className="font-bold tabular-nums text-tof-teal">
                      {s.totalPoints} pts
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {playerLookup.trim() && lookupResults.length === 0 && (
          <p className="mt-3 text-sm text-gray-400">Geen speler gevonden met die naam.</p>
        )}

        {lookedUpPlayer && (
          <div className="mt-4 rounded-xl border border-tof-teal/20 bg-tof-teal/5 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-tof-teal">
                  {periodLabel}
                </p>
                <PlayerNameWithBadge
                  name={lookedUpPlayer.nickname}
                  totalPoints={campTotalPoints[lookedUpPlayer.playerId] ?? 0}
                  nameClassName="text-2xl font-black text-tof-navy"
                  className="mt-1"
                />
                {lookedUpPlayer.groupId ? (
                  <p className="mt-0.5 text-sm text-gray-600">
                    {groupDisplayName(lookedUpPlayer.groupId, groupNames)}
                  </p>
                ) : (
                  <p className="mt-0.5 text-sm text-gray-400">Nog geen groep</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-black tabular-nums text-tof-navy">
                  {lookedUpPlayer.totalPoints}
                </p>
                <p className="text-xs font-semibold text-gray-500">punten</p>
                {lookedUpRank && (
                  <p className="mt-1 text-xs font-semibold text-tof-teal">
                    #{lookedUpRank} {viewPeriod === 'totaal' ? 'kamp' : 'vandaag'}
                  </p>
                )}
              </div>
            </div>
            {(lookedUpPlayer.fair_play > 0 ||
              lookedUpPlayer.respect > 0 ||
              lookedUpPlayer.samenwerking > 0 ||
              lookedUpPlayer.inzet > 0) && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-tof-teal/10 pt-3">
                {(['fair_play', 'respect', 'samenwerking', 'inzet'] as SpecialCategory[]).map(
                  (cat) =>
                    lookedUpPlayer[cat] > 0 ? (
                      <span
                        key={cat}
                        className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-tof-navy"
                      >
                        {SPECIAL_LABELS[cat]} · {lookedUpPlayer[cat]}
                      </span>
                    ) : null
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {playerOfDay && (
        <div className="tof-card overflow-hidden p-0">
          <div className="bg-gradient-to-br from-tof-teal to-emerald-600 px-6 py-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-white/70">
              {viewPeriod === 'totaal' ? 'Kampkampioen' : 'Speler van de dag'} · {periodLabel}
            </p>
            <PlayerNameWithBadge
              name={playerOfDay.nickname}
              totalPoints={campTotalPoints[playerOfDay.playerId] ?? 0}
              nameClassName="text-3xl font-black"
              className="mt-1"
            />
            <p className="mt-1 text-sm text-white/80">
              {playerOfDay.totalPoints} punten
              {playerOfDay.groupId
                ? ` · ${groupDisplayName(playerOfDay.groupId, groupNames)}`
                : ''}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="tof-card tof-card-body">
          <h2 className="font-bold text-tof-navy">
            {viewPeriod === 'totaal' ? 'Totaalscore spelers' : 'Dagscore spelers'}
          </h2>
          <p className="mt-1 text-xs text-gray-500">{periodLabel}</p>
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
                    <PlayerNameWithBadge
                      name={p.nickname}
                      totalPoints={campTotalPoints[p.playerId] ?? 0}
                      nameClassName="font-semibold text-tof-navy"
                    />
                    {p.groupId && (
                      <span className="text-xs text-gray-400">
                        {groupDisplayName(p.groupId, groupNames)}
                      </span>
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
          <p className="mt-1 text-xs text-gray-500">Totaal punten per groep · {periodLabel}</p>
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
                    <span className="font-semibold text-tof-navy">
                      {groupDisplayName(g.groupId, groupNames)}
                    </span>
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
        <h2 className="mb-3 font-bold text-tof-navy">
          {viewPeriod === 'totaal' ? 'Hoogtepunten kamp' : 'Hoogtepunten van vandaag'}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(['fair_play', 'respect', 'samenwerking', 'inzet'] as SpecialCategory[]).map(
            (cat) => {
              const { players: rankedPlayers, groups } = specialTops[cat];
              const hasData = rankedPlayers.length > 0 || groups.length > 0;
              return (
                <div key={cat} className="tof-card tof-card-body">
                  <h3 className="text-sm font-bold text-tof-navy">{SPECIAL_LABELS[cat]}</h3>
                  {!hasData ? (
                    <p className="mt-3 text-xs text-gray-400">
                      {viewPeriod === 'totaal' ? 'Nog geen badges' : 'Nog geen badges vandaag'}
                    </p>
                  ) : (
                    <div className="mt-3 space-y-3">
                      {rankedPlayers.length > 0 && (
                        <div>
                          <p className="text-[10px] font-bold uppercase text-gray-400">Spelers</p>
                          <ol className="mt-1 space-y-1">
                            {rankedPlayers.map((p, i) => (
                              <li key={p.playerId} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                  {i + 1}.{' '}
                                  <PlayerNameWithBadge
                                    name={p.nickname}
                                    totalPoints={campTotalPoints[p.playerId] ?? 0}
                                  />
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
                                  {i + 1}. {groupDisplayName(g.groupId, groupNames)}
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

        <h3 className="mt-8 font-bold text-tof-navy">Kampfoto&apos;s</h3>
        <p className="mt-1 text-sm text-gray-500">De nieuwste foto&apos;s van het kamp</p>
        <div className="mt-4">
          <CampMediaWall limit={4} />
        </div>
        <Link
          href="/kampfotos"
          className="mt-4 inline-flex text-sm font-semibold text-tof-teal hover:underline"
        >
          Bekijk alle kampfoto&apos;s
        </Link>
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
                    {formatGroupLabel(g, groupNames)} ({count} speler{count !== 1 ? 's' : ''})
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
                    : `Spelers in ${groupDisplayName(selectedGroupView as number, groupNames)}`}
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
                        <PlayerNameWithBadge
                          name={p.nickname}
                          totalPoints={campTotalPoints[p.id] ?? 0}
                          nameClassName="text-xs font-semibold text-tof-navy"
                        />
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
