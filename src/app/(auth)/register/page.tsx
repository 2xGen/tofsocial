import Link from 'next/link';
import Image from 'next/image';
import { Building2, User } from 'lucide-react';

const LOGO_SRC =
  'https://toftennis.nl/wp-content/uploads/2024/04/TOF-logo.svg';

export default function RegisterPage() {
  return (
    <div className="tof-card-prominent w-full max-w-lg p-8 md:p-10">
      <div className="mb-8 flex items-end justify-center gap-2">
        <Image src={LOGO_SRC} alt="TOF" width={120} height={48} className="h-10 w-auto" />
        <span className="pb-0.5 text-sm font-bold text-tof-navy">Social</span>
      </div>

      <h1 className="text-center text-2xl font-bold text-tof-navy">Registreren</h1>
      <p className="mt-2 text-center text-sm text-gray-600">
        Kies hoe je TOF Social wilt gebruiken.
      </p>

      <div className="mt-8 grid gap-4">
        <Link
          href="/register/club"
          className="tof-card flex items-start gap-4 tof-card-body transition-shadow hover:shadow-md"
        >
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tof-teal/15">
            <Building2 className="h-6 w-6 text-tof-navy" />
          </span>
          <div>
            <p className="font-bold text-tof-navy">Vereniging aanmaken</p>
            <p className="mt-1 text-sm text-gray-600">
              Je hebt een TOF-code ontvangen en wilt een clubpagina opzetten.
            </p>
          </div>
        </Link>

        <Link
          href="/register/player"
          className="tof-card flex items-start gap-4 tof-card-body transition-shadow hover:shadow-md"
        >
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tof-teal/15">
            <User className="h-6 w-6 text-tof-navy" />
          </span>
          <div>
            <p className="font-bold text-tof-navy">Speler worden</p>
            <p className="mt-1 text-sm text-gray-600">
              Sluit je aan bij je vereniging met een clubcode.
            </p>
          </div>
        </Link>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Al een account?{' '}
        <Link href="/login" className="font-semibold text-tof-teal hover:underline">
          Inloggen
        </Link>
      </p>
    </div>
  );
}
