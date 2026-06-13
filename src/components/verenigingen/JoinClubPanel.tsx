'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { KeyRound } from 'lucide-react';

export default function JoinClubPanel() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Vul je clubcode in.');
      return;
    }
    router.push(`/register/player?code=${encodeURIComponent(trimmed.toUpperCase())}`);
  }

  return (
    <div className="tof-card-prominent p-6 md:p-8">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tof-teal/15 text-tof-navy">
          <KeyRound className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-tof-navy">Aansluiten bij je vereniging</h2>
          <p className="mt-1 text-sm text-gray-600">
            Heb je een clubcode? Vul die in en maak je spelersaccount aan.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CLUB-XXXXXX"
              className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm uppercase outline-none focus:border-tof-teal"
            />
            <button type="submit" className="btn-primary shrink-0 justify-center px-6 py-3 text-sm">
              Vereniging joinen
            </button>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <p className="mt-3 text-xs text-gray-500">
            Geen code? Vraag die aan bij de jeugdcoördinator of trainer van je club.
          </p>
        </div>
      </div>
    </div>
  );
}
