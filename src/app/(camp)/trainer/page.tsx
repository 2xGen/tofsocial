'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CAMP_DAYS,
  CAMP_TRAINERS,
  POINT_OPTIONS,
  SPECIAL_CATEGORIES,
  type CampDay,
  type CampPointAmount,
  type CampTrainer,
  type SpecialCategory,
  type CampPlayer,
} from '@/types/camp';
import {
  awardPointsToGroup,
  awardPointsToPlayer,
  awardSpecialToPlayer,
  computePlayerStats,
  getCampPlayers,
  getCampStore,
  getTrainerSession,
  setActiveCampDay,
  setTrainerSession,
} from '@/lib/camp-store';
import { PlayerNameWithBadge } from '@/components/camp/PlayerHundredBadge';

type AwardMode = 'player' | 'group' | 'special';

export default function TrainerPage() {
  const [trainer, setTrainer] = useState<CampTrainer>(CAMP_TRAINERS[0]);
  const [day, setDay] = useState<CampDay>('ma');
  const [mode, setMode] = useState<AwardMode>('player');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [groupId, setGroupId] = useState(1);
  const [points, setPoints] = useState(10);
  const [customPointsInput, setCustomPointsInput] = useState('');
  const [description, setDescription] = useState('');
  const [specialCategory, setSpecialCategory] = useState<SpecialCategory>('respect');
  const [success, setSuccess] = useState('');
  const [players, setPlayers] = useState<CampPlayer[]>([]);
  const [campTotalPoints, setCampTotalPoints] = useState<Record<string, number>>({});

  useEffect(() => {
    const session = getTrainerSession();
    if (session) {
      setTrainer(session);
    } else {
      setTrainerSession(CAMP_TRAINERS[0]);
    }
    getCampStore().then((store) => setDay(store.activeDay));
    refresh();
  }, []);

  async function refresh() {
    const [playerList, totalStats] = await Promise.all([
      getCampPlayers(),
      computePlayerStats(),
    ]);
    setPlayers(playerList);
    setCampTotalPoints(
      Object.fromEntries(totalStats.map((s) => [s.playerId, s.totalPoints]))
    );
  }

  async function handleDayChange(d: CampDay) {
    setDay(d);
    await setActiveCampDay(d);
  }

  function switchTrainer(next: CampTrainer) {
    setTrainerSession(next);
    setTrainer(next);
    setSuccess('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess('');

    if (mode === 'special') {
      if (selectedPlayerIds.length === 0) return;
      await Promise.all(
        selectedPlayerIds.map((playerId) =>
          awardSpecialToPlayer({
            day,
            trainer,
            playerId,
            category: specialCategory,
            description,
          })
        )
      );
      const count = selectedPlayerIds.length;
      setSuccess(`Special badge toegekend aan ${count} speler${count > 1 ? 's' : ''}`);
      setDescription('');
      setSelectedPlayerIds([]);
      return;
    }

    if (mode === 'player') {
      if (selectedPlayerIds.length === 0 || points < 1) return;
      await Promise.all(
        selectedPlayerIds.map((playerId) =>
          awardPointsToPlayer({
            day,
            trainer,
            playerId,
            points,
            description,
          })
        )
      );
      const count = selectedPlayerIds.length;
      setSuccess(`+${points} punten toegekend aan ${count} speler${count > 1 ? 's' : ''}`);
      setDescription('');
      setSelectedPlayerIds([]);
      return;
    }

    if (mode === 'group') {
      if (points < 1) return;
      await awardPointsToGroup({
        day,
        trainer,
        groupId,
        points,
        description,
      });
      setSuccess(`+${points} punten toegekend aan groep ${groupId}`);
      setDescription('');
    }
  }

  const sortedPlayers = useMemo(
    () => [...players].sort((a, b) => a.nickname.localeCompare(b.nickname, 'nl')),
    [players]
  );

  const filteredPlayers = useMemo(() => {
    const q = playerSearch.trim().toLowerCase();
    if (!q) return sortedPlayers;
    return sortedPlayers.filter(
      (p) =>
        p.nickname.toLowerCase().includes(q) ||
        p.fullName.toLowerCase().includes(q) ||
        (p.groupId && String(p.groupId).includes(q))
    );
  }, [sortedPlayers, playerSearch]);

  function togglePlayer(id: string) {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function selectPresetPoints(p: CampPointAmount) {
    setPoints(p);
    setCustomPointsInput('');
  }

  function selectMode(next: AwardMode) {
    setMode(next);
    setSelectedPlayerIds([]);
    setPlayerSearch('');
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 space-y-3">
        <h1 className="text-2xl font-bold text-tof-navy">Trainer</h1>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Begeleider
          </p>
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
            {CAMP_TRAINERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTrainer(t)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  trainer === t
                    ? 'bg-white text-tof-navy shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">Dag</p>
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {CAMP_DAYS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleDayChange(d.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                  day === d.id ? 'bg-white text-tof-navy shadow-sm' : 'text-gray-500'
                }`}
              >
                {d.label.slice(0, 2)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {(
          [
            { id: 'player', label: 'Speler' },
            { id: 'group', label: 'Hele groep' },
            { id: 'special', label: 'Special' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => selectMode(m.id)}
            className={`rounded-xl border py-2.5 text-sm font-bold ${
              mode === m.id
                ? 'border-tof-teal bg-tof-teal/10 text-tof-navy'
                : 'border-gray-100 text-gray-600'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="tof-card tof-card-body space-y-4">
        {success && (
          <p className="rounded-xl bg-tof-teal/15 px-4 py-3 text-sm font-semibold text-tof-navy">
            {success}
          </p>
        )}

        {mode === 'player' || mode === 'special' ? (
          <div>
        <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="text-sm font-semibold text-tof-navy">
                    Spelers{' '}
                    {selectedPlayerIds.length > 0 && (
                      <span className="font-normal text-gray-500">
                        ({selectedPlayerIds.length} geselecteerd)
                      </span>
                    )}
                  </label>
                  {selectedPlayerIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedPlayerIds([])}
                      className="text-xs font-semibold text-tof-teal hover:underline"
                    >
                      Wis selectie
                    </button>
                  )}
                </div>
                <p className="mb-2 text-xs text-gray-400">
                  Gekleurde badge = honderdtal bereikt, speler mag button halen
                </p>
            <input
              type="search"
              value={playerSearch}
              onChange={(e) => setPlayerSearch(e.target.value)}
              placeholder="Zoek op naam of groep…"
              className="mb-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-tof-teal"
            />
            <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-100 p-2">
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {filteredPlayers.map((p) => {
                  const selected = selectedPlayerIds.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlayer(p.id)}
                      className={`rounded-lg border px-2 py-2 text-left text-xs font-semibold transition-colors ${
                        selected
                          ? 'border-tof-teal bg-tof-teal/15 text-tof-navy'
                          : 'border-gray-100 text-gray-600 hover:border-tof-teal/30'
                      }`}
                    >
                      <PlayerNameWithBadge
                        name={p.nickname}
                        totalPoints={campTotalPoints[p.id] ?? 0}
                        nameClassName="text-xs font-semibold"
                      />
                      {p.groupId ? (
                        <span className="mt-0.5 block text-[10px] font-medium text-gray-400">
                          G{p.groupId}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              {filteredPlayers.length === 0 && (
                <p className="py-4 text-center text-xs text-gray-400">Geen spelers gevonden</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-tof-navy">Groep</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGroupId(g)}
                  className={`rounded-xl py-2.5 text-sm font-bold ${
                    groupId === g ? 'bg-tof-teal text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {mode === 'special' ? (
          <div>
            <p className="mb-2 text-sm font-semibold text-tof-navy">Special badge</p>
            <div className="grid grid-cols-2 gap-2">
              {SPECIAL_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSpecialCategory(c.id)}
                  className={`rounded-xl border py-3 text-sm font-bold ${
                    specialCategory === c.id
                      ? 'border-tof-teal bg-tof-teal/10 text-tof-navy'
                      : 'border-gray-100 text-gray-600'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-sm font-semibold text-tof-navy">Punten</p>
            <div className="flex gap-2">
              {POINT_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => selectPresetPoints(p)}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${
                    points === p && !customPointsInput
                      ? 'bg-tof-teal text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  +{p}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <label className="mb-1 block text-xs font-semibold text-gray-500">
                Of ander aantal
              </label>
              <input
                type="number"
                min={1}
                max={999}
                value={customPointsInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomPointsInput(value);
                  const parsed = parseInt(value, 10);
                  if (parsed > 0) setPoints(parsed);
                }}
                placeholder="bijv. 25"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-tof-teal"
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-tof-navy">Omschrijving</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="bijv. gewonnen tiebreak"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          />
        </div>

        <button
          type="submit"
          disabled={mode !== 'group' && selectedPlayerIds.length === 0}
          className="btn-primary w-full justify-center py-3.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mode === 'special'
            ? selectedPlayerIds.length > 1
              ? `Special toekennen (${selectedPlayerIds.length})`
              : 'Special toekennen'
            : mode === 'player'
              ? selectedPlayerIds.length > 1
                ? `Punten toekennen (${selectedPlayerIds.length})`
                : 'Punten toekennen'
              : 'Punten toekennen'}
        </button>
      </form>
    </div>
  );
}
