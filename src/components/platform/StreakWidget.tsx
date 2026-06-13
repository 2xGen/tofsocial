'use client';

import { useEffect, useState } from 'react';
import { Flame, Clock } from 'lucide-react';

interface StreakWidgetProps {
  streakDays: number;
  lastActivityAt: string;
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '00:00:00';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function StreakWidget({ streakDays, lastActivityAt }: StreakWidgetProps) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const deadline = new Date(lastActivityAt).getTime() + 24 * 60 * 60 * 1000;
    const tick = () => setRemaining(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lastActivityAt]);

  return (
    <div className="tof-card overflow-hidden p-0">
      <div className="bg-gradient-to-br from-tof-teal to-emerald-600 px-5 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-6 w-6" />
            <div>
              <p className="text-2xl font-black">{streakDays} dagen</p>
              <p className="text-xs font-semibold text-white/80">Actieve reeks</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
              Nog loggen binnen
            </p>
            <p className="font-mono text-lg font-black tabular-nums">
              {formatCountdown(remaining)}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex justify-center gap-3">
          {Array.from({ length: streakDays }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  i < streakDays - 1
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-tof-teal text-white ring-4 ring-emerald-100'
                }`}
              >
                <Flame className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-bold text-gray-500">Dag {i + 1}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2 rounded-xl bg-emerald-50 px-4 py-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-xs leading-relaxed text-emerald-900">
            <strong>Reeks telt automatisch.</strong> Log minstens één activiteit per 24 uur —
            speeltijd, wedstrijd of iets anders op de baan.
          </p>
        </div>
      </div>
    </div>
  );
}
