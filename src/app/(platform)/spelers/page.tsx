'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Swords, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getClubMembers } from '@/lib/store';
import { DEMO_MEMBERS, DEMO_PLAYER } from '@/lib/demo';
import { DemoBanner } from '@/components/platform/FeedItemCard';
import PlayerAvatar from '@/components/platform/PlayerAvatar';

export default function SpelersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isDemo = !user;
  const [challenged, setChallenged] = useState<string | null>(null);

  const members = isDemo
    ? DEMO_MEMBERS.filter((m) => m.name !== DEMO_PLAYER.name)
    : user?.clubId
      ? getClubMembers(user.clubId)
          .filter((m) => m.id !== user.id)
          .map((m) => ({ id: m.id, name: m.name, weeklyPoints: 0, rank: 0 }))
      : [];

  function handleChallenge(name: string) {
    setChallenged(name);
    if (isDemo) {
      setTimeout(() => router.push('/vereniging'), 1200);
    } else {
      router.push(`/log?type=uitdaging_speler&target=${encodeURIComponent(name)}`);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {isDemo && <DemoBanner className="mb-6" />}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-tof-navy">Spelers uitdagen</h1>
        <p className="mt-1 text-sm text-gray-600">
          Kies een clubgenoot voor een wedstrijd of uitdaging. +30 punten bij acceptatie.
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <div className="flex gap-3">
          <Swords className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold text-tof-navy">Hoe werkt uitdagen?</p>
            <ol className="mt-2 space-y-1 text-sm text-gray-600">
              <li>1. Kies een speler uit je vereniging</li>
              <li>2. Stuur een uitdaging — zij krijgen een melding</li>
              <li>3. Speel de wedstrijd en meld het resultaat</li>
              <li>4. Beide spelers verdienen punten</li>
            </ol>
          </div>
        </div>
      </div>

      <ul className="space-y-3">
        {members.map((member) => (
          <li
            key={member.id}
            className="tof-card flex items-center justify-between gap-4 tof-card-body"
          >
            <div className="flex items-center gap-3">
              <PlayerAvatar name={member.name} />
              <div>
                <p className="font-bold text-tof-navy">{member.name}</p>
                {isDemo && (
                  <p className="text-xs text-gray-500">
                    #{member.rank} · {member.weeklyPoints} pts deze week
                  </p>
                )}
              </div>
            </div>

            {challenged === member.name ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                <Check className="h-4 w-4" />
                Verstuurd!
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleChallenge(member.name)}
                className="inline-flex items-center gap-1.5 rounded-full bg-tof-teal px-4 py-2 text-sm font-bold text-tof-navy transition-transform hover:scale-105"
              >
                <Swords className="h-4 w-4" />
                Uitdagen
              </button>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-center text-sm text-gray-500">
        Of{' '}
        <Link href="/log" className="font-semibold text-tof-teal hover:underline">
          meld een andere activiteit
        </Link>
      </p>
    </div>
  );
}
