'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

const LOGO_SRC =
  'https://toftennis.nl/wp-content/uploads/2024/04/TOF-logo.svg';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      login(email, password);
      router.push('/vereniging');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Inloggen mislukt.');
    }
  }

  return (
    <div className="tof-card-prominent w-full max-w-md p-8 md:p-10">
      <div className="mb-8 flex items-end justify-center gap-2">
        <Image src={LOGO_SRC} alt="TOF" width={120} height={48} className="h-10 w-auto" />
        <span className="pb-0.5 text-sm font-bold text-tof-navy">Social</span>
      </div>

      <h1 className="text-center text-2xl font-bold text-tof-navy">Inloggen</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Log in op je vereniging of spelersaccount.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          />
        </div>
        <button type="submit" className="btn-primary w-full justify-center py-3">
          Inloggen
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Nog geen account?{' '}
        <Link href="/register" className="font-semibold text-tof-teal hover:underline">
          Registreren
        </Link>
      </p>
    </div>
  );
}
