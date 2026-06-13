'use client';

import { motion } from 'framer-motion';
import { getRankedClubs } from '@/data/clubLeaderboard';

function RankBadge({ rank }: { rank: number }) {
  const styles =
    rank === 1
      ? 'bg-amber-400 text-amber-950'
      : rank === 2
        ? 'bg-gray-300 text-gray-700'
        : rank === 3
          ? 'bg-orange-300 text-orange-900'
          : 'bg-gray-100 text-gray-500';

  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-xs font-black ${styles}`}
    >
      {rank}
    </span>
  );
}

export default function ClubLeaderboard() {
  const clubs = getRankedClubs();

  return (
    <div className="tof-card overflow-hidden p-0">
      <div className="border-b border-gray-100 bg-gray-50 px-4 py-4 md:px-6">
        <h2 className="font-bold text-tof-navy">Actieve verenigingen</h2>
        <p className="mt-1 text-sm text-gray-600">
          Gerangschikt op gemiddelde TOF Social Score per{' '}
          <strong className="font-semibold text-tof-navy">actieve speler</strong> deze week.
        </p>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <th className="w-12 px-6 py-3 text-left font-bold">#</th>
              <th className="px-3 py-3 text-left font-bold">Vereniging</th>
              <th className="w-20 px-3 py-3 text-right font-bold">Leden</th>
              <th className="w-24 px-3 py-3 text-right font-bold">Actief</th>
              <th className="w-20 px-3 py-3 text-right font-bold">Totaal</th>
              <th className="w-24 bg-tof-teal/5 px-4 py-3 text-right font-bold text-tof-teal">
                Gem./actief
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clubs.map((club) => (
              <tr key={club.id} className="transition-colors hover:bg-gray-50/80">
                <td className="px-6 py-3.5">
                  <RankBadge rank={club.rank} />
                </td>
                <td className="px-3 py-3.5">
                  <p className="font-bold text-tof-navy">{club.name}</p>
                  <p className="text-xs text-gray-500">
                    {club.city} · {club.sports.join(' & ')}
                  </p>
                </td>
                <td className="px-3 py-3.5 text-right font-bold tabular-nums text-tof-navy">
                  {club.totalMembers}
                </td>
                <td className="px-3 py-3.5 text-right">
                  <span className="font-bold tabular-nums text-tof-navy">{club.activeMembers}</span>
                  <span className="mt-0.5 block text-[10px] font-medium tabular-nums text-gray-400">
                    {club.activeRate}%
                  </span>
                </td>
                <td className="px-3 py-3.5 text-right font-bold tabular-nums text-tof-navy">
                  {club.totalScore}
                </td>
                <td className="bg-tof-teal/5 px-4 py-3.5 text-right text-lg font-black tabular-nums text-tof-navy">
                  {club.avgPerActive}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-gray-100 md:hidden">
        {clubs.map((club, index) => (
          <motion.li
            key={club.id}
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.03 }}
            className="px-4 py-4"
          >
            <div className="flex items-start gap-3">
              <RankBadge rank={club.rank} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-tof-navy">{club.name}</p>
                <p className="text-xs text-gray-500">
                  {club.city} · {club.sports.join(' & ')}
                </p>
              </div>
              <div className="shrink-0 rounded-lg bg-tof-teal/10 px-2.5 py-1.5 text-right">
                <p className="text-[10px] font-semibold uppercase text-gray-400">Gem.</p>
                <p className="text-lg font-black tabular-nums leading-none text-tof-navy">
                  {club.avgPerActive}
                </p>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3">
              <div className="text-center">
                <dt className="text-[10px] font-semibold uppercase text-gray-400">Leden</dt>
                <dd className="mt-0.5 text-sm font-bold tabular-nums text-tof-navy">
                  {club.totalMembers}
                </dd>
              </div>
              <div className="border-x border-gray-200 text-center">
                <dt className="text-[10px] font-semibold uppercase text-gray-400">Actief</dt>
                <dd className="mt-0.5 text-sm font-bold tabular-nums text-tof-navy">
                  {club.activeMembers}
                </dd>
                <dd className="text-[10px] tabular-nums text-gray-400">{club.activeRate}%</dd>
              </div>
              <div className="text-center">
                <dt className="text-[10px] font-semibold uppercase text-gray-400">Totaal</dt>
                <dd className="mt-0.5 text-sm font-bold tabular-nums text-tof-navy">
                  {club.totalScore}
                </dd>
              </div>
            </dl>
          </motion.li>
        ))}
      </ul>

      <div className="border-t border-gray-100 bg-gray-50 px-4 py-3.5 text-xs leading-relaxed text-gray-500 md:px-6">
        <strong className="font-semibold text-tof-navy">Actieve speler</strong> = minstens één
        melding deze week. Rangschikking op gemiddelde score per actieve speler — niet op
        clubgrootte.
      </div>
    </div>
  );
}
