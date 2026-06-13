import Link from 'next/link';
import { Activity, Trophy, Users } from 'lucide-react';
import { DEMO_MEMBERS } from '@/lib/demo';
import PlayerAvatar from './PlayerAvatar';

export default function ClubOverview() {
  const leaderboard = [...DEMO_MEMBERS].sort((a, b) => b.weeklyPoints - a.weeklyPoints);

  return (
    <div className="space-y-5">
      <div className="tof-card tof-card-body">
        <h3 className="text-sm font-bold text-tof-navy">Club in cijfers</h3>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <Users className="mx-auto h-4 w-4 text-tof-teal" />
            <p className="mt-1 text-xl font-black text-tof-navy">86</p>
            <p className="text-[10px] font-semibold text-gray-500">Spelers</p>
          </div>
          <div>
            <Activity className="mx-auto h-4 w-4 text-tof-teal" />
            <p className="mt-1 text-xl font-black text-tof-navy">248</p>
            <p className="text-[10px] font-semibold text-gray-500">Wedstrijden</p>
          </div>
          <div>
            <Trophy className="mx-auto h-4 w-4 text-tof-teal" />
            <p className="mt-1 text-xl font-black text-tof-navy">24</p>
            <p className="text-[10px] font-semibold text-gray-500">Deze week</p>
          </div>
        </div>
      </div>

      <div className="tof-card tof-card-body">
        <h3 className="text-sm font-bold text-tof-navy">Ranglijst deze week</h3>
        <ol className="mt-3 space-y-2">
          {leaderboard.slice(0, 5).map((player, i) => (
            <li key={player.id}>
              <Link
                href="/profiel"
                className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 transition-colors hover:bg-tof-teal/10"
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-black ${
                      i < 3 ? 'bg-tof-teal text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <PlayerAvatar name={player.name} size="sm" />
                  <span className="text-sm font-semibold text-tof-navy">{player.name}</span>
                </span>
                <span className="text-xs font-bold text-tof-navy">+{player.weeklyPoints}</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>

      <Link href="/profiel" className="btn-secondary w-full justify-center py-2.5 text-sm">
        Naar mijn profiel →
      </Link>
    </div>
  );
}
