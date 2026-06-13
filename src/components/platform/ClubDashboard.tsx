'use client';

import { motion } from 'framer-motion';
import type { Sport } from '@/types';

const weeklyByDay = [
  { day: 'Ma', tennis: 12, padel: 8 },
  { day: 'Di', tennis: 18, padel: 14 },
  { day: 'Wo', tennis: 9, padel: 6 },
  { day: 'Do', tennis: 22, padel: 16 },
  { day: 'Vr', tennis: 15, padel: 11 },
  { day: 'Za', tennis: 28, padel: 20 },
  { day: 'Zo', tennis: 20, padel: 15 },
];

const maxTotal = Math.max(...weeklyByDay.map((d) => d.tennis + d.padel));

interface ClubDashboardProps {
  sportFilter: 'all' | Sport;
}

export default function ClubDashboard({ sportFilter }: ClubDashboardProps) {
  const tennisTotal = weeklyByDay.reduce((s, d) => s + d.tennis, 0);
  const padelTotal = weeklyByDay.reduce((s, d) => s + d.padel, 0);
  const clubTotal = tennisTotal + padelTotal;

  const maxForFilter =
    sportFilter === 'tennis'
      ? Math.max(...weeklyByDay.map((d) => d.tennis), 1)
      : sportFilter === 'padel'
        ? Math.max(...weeklyByDay.map((d) => d.padel), 1)
        : maxTotal;

  const sportRows = [
    { id: 'tennis' as const, label: 'Tennis', count: tennisTotal, bar: 'bg-tof-teal' },
    { id: 'padel' as const, label: 'Padel', count: padelTotal, bar: 'bg-violet-400' },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="tof-card tof-card-body lg:col-span-2">
        <h3 className="text-sm font-bold text-tof-navy">Activiteit deze week</h3>
        <p className="mt-0.5 text-xs text-gray-500">Meldingen per dag op de club</p>
        <div className="mt-5 flex items-end justify-between gap-2" style={{ height: 140 }}>
          {weeklyByDay.map((item, index) => {
            const showTennis = sportFilter === 'all' || sportFilter === 'tennis';
            const showPadel = sportFilter === 'all' || sportFilter === 'padel';
            const dayTotal =
              (showTennis ? item.tennis : 0) + (showPadel ? item.padel : 0);
            const heightPct = maxForFilter > 0 ? (dayTotal / maxForFilter) * 100 : 0;

            return (
              <div key={item.day} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-bold tabular-nums text-tof-navy">
                  {dayTotal}
                </span>
                <div className="flex w-full flex-col justify-end" style={{ height: 100 }}>
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${heightPct}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.04, duration: 0.4 }}
                    className="flex w-full min-h-[4px] flex-col justify-end overflow-hidden rounded-t-lg"
                    style={{ height: `${heightPct}%` }}
                  >
                    {showPadel && sportFilter === 'all' && dayTotal > 0 && (
                      <div
                        className="w-full bg-violet-400"
                        style={{
                          flex: item.padel,
                          minHeight: item.padel ? 2 : 0,
                        }}
                      />
                    )}
                    {showTennis && sportFilter === 'all' && dayTotal > 0 && (
                      <div
                        className="w-full bg-tof-teal"
                        style={{
                          flex: item.tennis,
                          minHeight: item.tennis ? 2 : 0,
                        }}
                      />
                    )}
                    {sportFilter === 'tennis' && (
                      <div className="h-full w-full rounded-t-lg bg-tof-teal" />
                    )}
                    {sportFilter === 'padel' && (
                      <div className="h-full w-full rounded-t-lg bg-violet-400" />
                    )}
                  </motion.div>
                </div>
                <span className="text-[10px] font-semibold text-gray-500">{item.day}</span>
              </div>
            );
          })}
        </div>
        {sportFilter === 'all' && (
          <div className="mt-4 flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-tof-teal" /> Tennis
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-violet-400" /> Padel
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="tof-card tof-card-body">
          <h3 className="text-sm font-bold text-tof-navy">Deze week op de club</h3>
          <p className="mt-0.5 text-xs text-gray-500">Meldingen per onderdeel</p>
          <ul className="mt-4 divide-y divide-gray-100">
            {sportRows.map((row) => {
              const hidden =
                sportFilter !== 'all' && sportFilter !== row.id;
              if (hidden) return null;

              return (
                <li key={row.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <span className="flex items-center gap-2 text-sm font-semibold text-tof-navy">
                    <span className={`h-2 w-2 rounded-full ${row.bar}`} />
                    {row.label}
                  </span>
                  <span className="text-sm font-black tabular-nums text-tof-navy">
                    {row.count}
                    <span className="ml-1 text-xs font-medium text-gray-400">meldingen</span>
                  </span>
                </li>
              );
            })}
          </ul>
          {sportFilter === 'all' && (
            <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <span className="font-bold text-tof-navy">{clubTotal}</span> meldingen totaal
            </p>
          )}
        </div>

        <div className="tof-card tof-card-body">
          <h3 className="text-sm font-bold text-tof-navy">Betrokkenheid</h3>
          <ul className="mt-3 space-y-3">
            {[
              { label: 'Actieve spelers', value: '74%', pct: 74 },
              { label: 'Nieuwe spelers', value: '+8', pct: 40 },
              { label: 'Gem. speeltijd', value: '4,2u', pct: 65 },
            ].map((item) => (
              <li key={item.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-gray-600">{item.label}</span>
                  <span className="font-bold text-tof-navy">{item.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-tof-teal"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
