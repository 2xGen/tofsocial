'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  approveJoinRequest,
  getClubJoinRequests,
  getClubMembers,
} from '@/lib/store';
import type { JoinRequest, User } from '@/types';

export default function ClubPage() {
  const { user, club, refresh } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<User[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user?.role !== 'club_admin') {
      router.replace('/vereniging');
      return;
    }
    if (club) {
      setMembers(getClubMembers(club.id));
      setRequests(getClubJoinRequests(club.id).filter((r) => r.status === 'pending'));
    }
  }, [user, club, router]);

  function copyCode() {
    if (!club) return;
    navigator.clipboard.writeText(club.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleApprove(requestId: string) {
    approveJoinRequest(requestId);
    refresh();
    if (club) {
      setMembers(getClubMembers(club.id));
      setRequests(getClubJoinRequests(club.id).filter((r) => r.status === 'pending'));
    }
  }

  if (!club) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-tof-navy">{club.name}</h1>
        <p className="mt-1 text-sm capitalize text-gray-600">{club.sport}</p>
      </div>

      <div className="tof-card tof-card-body">
        <h2 className="font-bold text-tof-navy">Clubcode voor spelers</h2>
        <p className="mt-2 text-sm text-gray-600">
          Deel deze code met jeugdspelers zodat zij zich kunnen aanmelden.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <code className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-lg font-black tracking-wider text-tof-navy">
            {club.joinCode}
          </code>
          <button
            type="button"
            onClick={copyCode}
            className="inline-flex items-center gap-2 rounded-xl bg-tof-teal px-4 py-3 text-sm font-bold text-tof-navy"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Gekopieerd' : 'Kopieer'}
          </button>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          Spelers kunnen zich registreren via{' '}
          <span className="font-semibold">/register/player</span> met deze code.
        </p>
      </div>

      {requests.length > 0 && (
        <div className="tof-card tof-card-body">
          <h2 className="font-bold text-tof-navy">Openstaande aanvragen</h2>
          <ul className="mt-4 space-y-3">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
              >
                <span className="font-semibold text-tof-navy">{req.userName}</span>
                <button
                  type="button"
                  onClick={() => handleApprove(req.id)}
                  className="rounded-full bg-tof-teal px-4 py-1.5 text-sm font-bold text-tof-navy"
                >
                  Goedkeuren
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="tof-card tof-card-body">
        <h2 className="font-bold text-tof-navy">Spelers ({members.length})</h2>
        <ul className="mt-4 divide-y divide-gray-100">
          {members.map((member) => (
            <li key={member.id} className="flex items-center justify-between py-3">
              <span className="font-medium text-tof-navy">{member.name}</span>
              <span className="text-xs text-gray-500">
                {member.role === 'club_admin' ? 'Beheerder' : 'Speler'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
