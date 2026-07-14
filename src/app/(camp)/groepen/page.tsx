'use client';

import { useEffect, useState } from 'react';
import { GROUP_NUMBERS } from '@/types/camp';
import { getCampPlayers, setPlayerGroup } from '@/lib/camp-store';
import type { CampPlayer } from '@/types/camp';

export default function GroepenPage() {
  const [players, setPlayers] = useState<CampPlayer[]>([]);

  useEffect(() => {
    getCampPlayers().then(setPlayers);
  }, []);

  async function handleGroupChange(playerId: string, value: string) {
    const groupId = value === '' ? null : parseInt(value, 10);
    await setPlayerGroup(playerId, groupId);
    setPlayers(await getCampPlayers());
  }

  const assigned = players.filter((p) => p.groupId !== null).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-tof-navy">Groepen indelen</h1>
      <p className="mt-2 text-sm text-gray-600">
        Wijs elke speler toe aan groep 1–9.{' '}
        <strong className="text-tof-navy">
          {assigned}/{players.length}
        </strong>{' '}
        ingedeeld.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9">
        {GROUP_NUMBERS.map((g) => {
          const count = players.filter((p) => p.groupId === g).length;
          return (
            <div
              key={g}
              className="rounded-xl border border-gray-100 bg-white px-2 py-2 text-center shadow-sm"
            >
              <p className="text-lg font-black text-tof-navy">{g}</p>
              <p className="text-[10px] text-gray-400">{count} spelers</p>
            </div>
          );
        })}
      </div>

      <ul className="mt-6 space-y-2">
        {players.map((player) => (
          <li
            key={player.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
          >
            <span className="font-semibold text-tof-navy">{player.nickname}</span>
            <select
              value={player.groupId ?? ''}
              onChange={(e) => handleGroupChange(player.id, e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-tof-teal"
            >
              <option value="">Geen groep</option>
              {GROUP_NUMBERS.map((g) => (
                <option key={g} value={g}>
                  Groep {g}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
