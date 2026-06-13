'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { SportFocusSelector } from '@/components/platform/SportFocusSelector';
import type { PlayerSportFocus } from '@/types';

const LOGO_SRC =
  'https://toftennis.nl/wp-content/uploads/2024/04/TOF-logo.svg';

function RegisterPlayerForm() {
  const { registerPlayer, requestJoin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'direct' | 'request'>('direct');
  const [joinCode, setJoinCode] = useState(searchParams.get('code') ?? '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sportFocus, setSportFocus] = useState<PlayerSportFocus>('beide');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'direct') {
        registerPlayer({ joinCode, name, email, password, sportFocus });
        router.push('/vereniging');
      } else {
        requestJoin({ joinCode, name, email, password, sportFocus });
        router.push('/wachten');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registratie mislukt.');
    }
  }

  return (
    <div className="tof-card-prominent w-full max-w-md p-8 md:p-10">
      <div className="mb-6 flex items-end justify-center gap-2">
        <Image src={LOGO_SRC} alt="TOF" width={120} height={48} className="h-10 w-auto" />
        <span className="pb-0.5 text-sm font-bold text-tof-navy">Social</span>
      </div>

      <h1 className="text-center text-2xl font-bold text-tof-navy">Speler worden</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Vul de clubcode in die je van je vereniging hebt gekregen.
      </p>

      <div className="mt-6 flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => setMode('direct')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === 'direct' ? 'bg-white text-tof-navy shadow-sm' : 'text-gray-500'
          }`}
        >
          Direct lid
        </button>
        <button
          type="button"
          onClick={() => setMode('request')}
          className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
            mode === 'request' ? 'bg-white text-tof-navy shadow-sm' : 'text-gray-500'
          }`}
        >
          Aanvraag indienen
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label htmlFor="joinCode" className="mb-1.5 block text-sm font-semibold text-tof-navy">
            Clubcode
          </label>
          <input
            id="joinCode"
            required
            placeholder="CLUB-XXXXXX"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm uppercase outline-none focus:border-tof-teal"
          />
        </div>

        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-semibold text-tof-navy">
            Jouw naam
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-tof-navy">
            E-mailadres
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-tof-navy">
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          />
        </div>

        <div>
          <p className="mb-1.5 text-sm font-semibold text-tof-navy">
            Waar speel jij op de club?
          </p>
          <p className="mb-3 text-xs text-gray-500">
            Kies wat op jou van toepassing is. Je hoeft niet beide te spelen.
          </p>
          <SportFocusSelector value={sportFocus} onChange={setSportFocus} compact />
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-3">
          {mode === 'direct' ? 'Account aanmaken' : 'Aanvraag versturen'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/register" className="font-semibold text-tof-teal hover:underline">
          Terug
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPlayerPage() {
  return (
    <Suspense>
      <RegisterPlayerForm />
    </Suspense>
  );
}
