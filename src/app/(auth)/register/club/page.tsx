'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import type { Club } from '@/types';

const LOGO_SRC =
  'https://toftennis.nl/wp-content/uploads/2024/04/TOF-logo.svg';

export default function RegisterClubPage() {
  const { registerClub } = useAuth();
  const router = useRouter();
  const [tofCode, setTofCode] = useState('');
  const [clubName, setClubName] = useState('');
  const [sport, setSport] = useState<Club['sport']>('beide');
  const [adminName, setAdminName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      registerClub({ tofCode, clubName, sport, adminName, email, password });
      router.push('/club');
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

      <h1 className="text-center text-2xl font-bold text-tof-navy">Vereniging aanmaken</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Vul je TOF-code in om je clubpagina te starten.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label htmlFor="tofCode" className="mb-1.5 block text-sm font-semibold text-tof-navy">
            TOF-code
          </label>
          <input
            id="tofCode"
            required
            placeholder="TOF-DEMO"
            value={tofCode}
            onChange={(e) => setTofCode(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm uppercase outline-none focus:border-tof-teal"
          />
          <p className="mt-1 text-xs text-gray-500">Demo-code: TOF-DEMO</p>
        </div>

        <div>
          <label htmlFor="clubName" className="mb-1.5 block text-sm font-semibold text-tof-navy">
            Naam vereniging
          </label>
          <input
            id="clubName"
            required
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          />
        </div>

        <div>
          <label htmlFor="sport" className="mb-1.5 block text-sm font-semibold text-tof-navy">
            Sport
          </label>
          <select
            id="sport"
            value={sport}
            onChange={(e) => setSport(e.target.value as Club['sport'])}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          >
            <option value="tennis">Tennis</option>
            <option value="padel">Padel</option>
            <option value="beide">Tennis &amp; padel</option>
          </select>
        </div>

        <div>
          <label htmlFor="adminName" className="mb-1.5 block text-sm font-semibold text-tof-navy">
            Jouw naam
          </label>
          <input
            id="adminName"
            required
            value={adminName}
            onChange={(e) => setAdminName(e.target.value)}
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

        <button type="submit" className="btn-primary w-full justify-center py-3">
          Vereniging aanmaken
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
