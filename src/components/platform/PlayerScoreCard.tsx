import { Flame, Trophy } from 'lucide-react';
import type { PlayerSportFocus } from '@/types';
import { PLAYER_SPORT_FOCUS_LABELS } from '@/types';
import PlayerAvatar from './PlayerAvatar';

interface PlayerScoreCardProps {
  name: string;
  clubName: string;
  weeklyPoints: number;
  rank?: number;
  streak?: number;
  sportFocus?: PlayerSportFocus;
}

export default function PlayerScoreCard({
  name,
  clubName,
  weeklyPoints,
  rank,
  streak,
  sportFocus,
}: PlayerScoreCardProps) {
  return (
    <div className="tof-card overflow-hidden p-0">
      <div className="bg-gradient-to-br from-tof-navy to-tof-navy/90 px-5 py-5 text-white">
        <div className="flex items-center gap-3">
          <PlayerAvatar name={name} size="lg" />
          <div>
            <p className="font-bold">{name}</p>
            <p className="text-xs text-white/70">{clubName}</p>
            {sportFocus && (
              <p className="mt-0.5 text-[10px] font-medium text-white/50">
                {PLAYER_SPORT_FOCUS_LABELS[sportFocus]}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-100 bg-white">
        <div className="px-3 py-4 text-center">
          <p className="text-2xl font-black text-tof-navy">{weeklyPoints}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
            Punten
          </p>
        </div>
        {rank !== undefined && (
          <div className="px-3 py-4 text-center">
            <p className="flex items-center justify-center gap-1 text-2xl font-black text-tof-navy">
              <Trophy className="h-5 w-5 text-tof-teal" />
              {rank}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Rang
            </p>
          </div>
        )}
        {streak !== undefined && (
          <div className="px-3 py-4 text-center">
            <p className="flex items-center justify-center gap-1 text-2xl font-black text-tof-navy">
              <Flame className="h-5 w-5 text-orange-400" />
              {streak}
            </p>
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Reeks
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
