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
  type CampChallenge,
  type CampPlayer,
} from '@/types/camp';
import {
  awardPointsToGroup,
  awardPointsToPlayer,
  awardSpecialToPlayer,
  createCampChallenge,
  getCampChallenges,
  getCampPlayers,
  getCampStore,
  getTrainerSession,
  setActiveCampDay,
  setTrainerSession,
} from '@/lib/camp-store';

type AwardMode = 'player' | 'group' | 'special' | 'challenge';

export default function TrainerPage() {
  const [trainer, setTrainer] = useState<CampTrainer | null>(null);
  const [selectedTrainer, setSelectedTrainer] = useState<CampTrainer>(CAMP_TRAINERS[0]);
  const [day, setDay] = useState<CampDay>('ma');
  const [mode, setMode] = useState<AwardMode>('player');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [playerSearch, setPlayerSearch] = useState('');
  const [groupId, setGroupId] = useState(1);
  const [points, setPoints] = useState<CampPointAmount>(10);
  const [description, setDescription] = useState('');
  const [specialCategory, setSpecialCategory] = useState<SpecialCategory>('respect');
  const [challengeName, setChallengeName] = useState('');
  const [challengePoints, setChallengePoints] = useState<CampPointAmount>(10);
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [success, setSuccess] = useState('');
  const [challenges, setChallenges] = useState<CampChallenge[]>([]);
  const [players, setPlayers] = useState<CampPlayer[]>([]);

  useEffect(() => {
    setTrainer(getTrainerSession());
    getCampStore().then((store) => setDay(store.activeDay));
    refresh();
  }, []);

  async function refresh() {
    setPlayers(await getCampPlayers());
    setChallenges(await getCampChallenges());
  }

  async function loginTrainer() {
    setTrainerSession(selectedTrainer);
    setTrainer(selectedTrainer);
    await setActiveCampDay(day);
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
    if (!trainer) return;
    setSuccess('');

    if (mode === 'challenge' && challengeName.trim()) {
      const name = challengeName.trim();
      await createCampChallenge(name, challengePoints);
      setChallengeName('');
      await refresh();
      setSuccess(`Uitdaging "${name}" aangemaakt (+${challengePoints} pts)`);
      return;
    }

    const challenge = challenges.find((c) => c.id === selectedChallengeId);

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
      if (selectedPlayerIds.length === 0) return;
      const pts = challenge ? challenge.points : points;
      await Promise.all(
        selectedPlayerIds.map((playerId) =>
          awardPointsToPlayer({
            day,
            trainer,
            playerId,
            points: pts,
            description,
            challengeId: challenge?.id,
            challengeName: challenge?.name,
          })
        )
      );
      const count = selectedPlayerIds.length;
      setSuccess(`+${pts} punten toegekend aan ${count} speler${count > 1 ? 's' : ''}`);
      setDescription('');
      setSelectedPlayerIds([]);
      return;
    } else if (mode === 'group') {
      await awardPointsToGroup({
        day,
        trainer,
        groupId,
        points: challenge ? challenge.points : points,
        description,
        challengeId: challenge?.id,
        challengeName: challenge?.name,
      });
      setSuccess(`+${challenge ? challenge.points : points} punten toegekend aan groep ${groupId}`);
      setDescription('');
      return;
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

  function selectMode(next: AwardMode) {
    setMode(next);
    setSelectedPlayerIds([]);
    setPlayerSearch('');
  }

  if (!trainer) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-bold text-tof-navy">Trainer</h1>
        <p className="mt-2 text-sm text-gray-600">Selecteer je naam om punten toe te kennen.</p>
        <div className="tof-card tof-card-body mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-tof-navy">Begeleider</label>
            <div className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1">
              {CAMP_TRAINERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedTrainer(t)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                    selectedTrainer === t
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
            <label className="mb-2 block text-sm font-semibold text-tof-navy">Vandaag</label>
            <div className="grid grid-cols-4 gap-2">
              {CAMP_DAYS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDay(d.id)}
                  className={`rounded-xl border py-2 text-xs font-bold ${
                    day === d.id
                      ? 'border-tof-teal bg-tof-teal/10 text-tof-navy'
                      : 'border-gray-100 text-gray-500'
                  }`}
                >
                  {d.label.slice(0, 2)}
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={loginTrainer} className="btn-primary w-full justify-center py-3">
            Start als {selectedTrainer}
          </button>
        </div>
      </div>
    );
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

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            { id: 'player', label: 'Speler' },
            { id: 'group', label: 'Hele groep' },
            { id: 'special', label: 'Special' },
            { id: 'challenge', label: 'Uitdaging' },
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

        {mode === 'challenge' && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-tof-navy">
                Naam uitdaging
              </label>
              <input
                value={challengeName}
                onChange={(e) => setChallengeName(e.target.value)}
                placeholder="bijv. Longest rally"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-tof-navy">Punten</p>
              <div className="flex gap-2">
                {POINT_OPTIONS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setChallengePoints(p)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${
                      challengePoints === p
                        ? 'bg-tof-teal text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-3">
              Uitdaging aanmaken
            </button>
          </>
        )}

        {mode !== 'challenge' && (
          <>
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
                          {p.nickname}
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
                        groupId === g
                          ? 'bg-tof-teal text-white'
                          : 'bg-gray-100 text-gray-600'
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
              <>
                {challenges.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-tof-navy">
                      Uitdaging (optioneel)
                    </label>
                    <select
                      value={selectedChallengeId}
                      onChange={(e) => setSelectedChallengeId(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
                    >
                      <option value="">Geen uitdaging — vrije punten</option>
                      {challenges.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} (+{c.points})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {!selectedChallengeId && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-tof-navy">Punten</p>
                    <div className="flex gap-2">
                      {POINT_OPTIONS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPoints(p)}
                          className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${
                            points === p ? 'bg-tof-teal text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          +{p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-tof-navy">
                Omschrijving
              </label>
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
          </>
        )}
      </form>

      {challenges.length > 0 && mode !== 'challenge' && (
        <div className="mt-6 tof-card tof-card-body">
          <h3 className="text-sm font-bold text-tof-navy">Actieve uitdagingen</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {challenges.map((c) => (
              <li key={c.id}>
                {c.name} · +{c.points} pts
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
