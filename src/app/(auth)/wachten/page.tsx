'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function WaitingPage() {
  const { user } = useAuth();

  return (
    <div className="tof-card-prominent w-full max-w-md p-8 text-center md:p-10">
      <h1 className="text-2xl font-bold text-tof-navy">Aanvraag verstuurd</h1>
      <p className="mt-4 text-sm leading-relaxed text-gray-600">
        Hallo {user?.name}, je aanvraag wacht op goedkeuring van je vereniging. Zodra
        je bent goedgekeurd, zie je de activiteitenfeed.
      </p>
      <Link href="/login" className="btn-primary mt-8 inline-flex justify-center py-3">
        Naar inloggen
      </Link>
    </div>
  );
}
