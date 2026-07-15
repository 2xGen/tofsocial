'use client';

import { useEffect, useState } from 'react';
import { GROUP_NUMBERS, formatGroupLabel } from '@/types/camp';
import { getCampGroupNames, getCampPlayers, setCampGroupName, setPlayerGroup } from '@/lib/camp-store';
import { useCamp } from '@/lib/camp-context';
import type { CampPlayer } from '@/types/camp';

export default function GroepenPage() {
  const { campId } = useCamp();
  const [players, setPlayers] = useState<CampPlayer[]>([]);
  const [groupNames, setGroupNames] = useState<Record<number, string>>({});
  const [nameDrafts, setNameDrafts] = useState<Record<number, string>>({});

  async function refresh() {
    const [playerList, names] = await Promise.all([
      getCampPlayers(campId),
      getCampGroupNames(campId),
    ]);
    setPlayers(playerList);
    setGroupNames(names);
    setNameDrafts(
      Object.fromEntries(GROUP_NUMBERS.map((g) => [g, names[g] ?? ''])) as Record<number, string>
    );
  }

  useEffect(() => {
    refresh();
  }, [campId]);

  async function handleGroupChange(playerId: string, value: string) {
    const groupId = value === '' ? null : parseInt(value, 10);
    await setPlayerGroup(campId, playerId, groupId);
    setPlayers(await getCampPlayers(campId));
  }

  async function saveGroupName(groupId: number) {
    const name = (nameDrafts[groupId] ?? '').trim();
    if ((groupNames[groupId] ?? '') === name) return;
    await setCampGroupName(campId, groupId, name);
    const names = await getCampGroupNames(campId);
    setGroupNames(names);
    setNameDrafts((prev) => ({ ...prev, [groupId]: names[groupId] ?? '' }));
  }

  const assigned = players.filter((p) => p.groupId !== null).length;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-tof-navy">Groepen indelen</h1>
      <p className="mt-2 text-sm text-gray-600">
        Geef groepen een naam en wijs elke speler toe aan groep 1–9.{' '}
        <strong className="text-tof-navy">
          {assigned}/{players.length}
        </strong>{' '}
        ingedeeld.
      </p>

      <div className="mt-6">
        <h2 className="text-sm font-bold text-tof-navy">Groepsnamen</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GROUP_NUMBERS.map((g) => {
            const count = players.filter((p) => p.groupId === g).length;
            return (
              <div
                key={g}
                className="rounded-xl border border-gray-100 bg-white px-3 py-3 shadow-sm"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-tof-navy">Groep {g}</p>
                  <span className="text-[10px] text-gray-400">
                    {count} speler{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <input
                  type="text"
                  value={nameDrafts[g] ?? ''}
                  onChange={(e) =>
                    setNameDrafts((prev) => ({ ...prev, [g]: e.target.value }))
                  }
                  onBlur={() => saveGroupName(g)}
                  placeholder="bijv. De Eagles"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-tof-teal"
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-9">
        {GROUP_NUMBERS.map((g) => {
          const count = players.filter((p) => p.groupId === g).length;
          const label = groupNames[g]?.trim();
          return (
            <div
              key={g}
              className="rounded-xl border border-gray-100 bg-white px-2 py-2 text-center shadow-sm"
            >
              <p className="text-lg font-black text-tof-navy">{g}</p>
              {label ? (
                <p className="truncate text-[10px] font-semibold text-tof-teal">{label}</p>
              ) : null}
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
              className="max-w-[11rem] rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-tof-teal sm:max-w-none"
            >
              <option value="">Geen groep</option>
              {GROUP_NUMBERS.map((g) => (
                <option key={g} value={g}>
                  {formatGroupLabel(g, groupNames)}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
