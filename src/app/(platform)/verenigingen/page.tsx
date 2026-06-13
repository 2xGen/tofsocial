import Link from 'next/link';
import JoinClubPanel from '@/components/verenigingen/JoinClubPanel';
import ClubLeaderboard from '@/components/verenigingen/ClubLeaderboard';

export const metadata = {
  title: 'Verenigingen – TOF Social',
  description:
    'Ontdek actieve tennis- en padelverenigingen. Ranglijst op betrokkenheid per speler — sluit aan met je clubcode.',
};

export default function VerenigingenPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <span className="section-badge mb-2 inline-block">Verenigingen</span>
        <h1 className="text-2xl font-bold text-tof-navy md:text-3xl">
          Actieve clubs, eerlijke ranglijst
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600">
          Vergelijk verenigingen op betrokkenheid — gemiddelde score per actieve speler, niet
          alleen het totaal aantal leden. Grote clubs staan niet automatisch bovenaan.
        </p>
      </div>

      <JoinClubPanel />

      <ClubLeaderboard />

      <p className="text-center text-sm text-gray-600">
        Al lid van een club?{' '}
        <Link href="/vereniging" className="font-semibold text-tof-teal hover:underline">
          Ga naar je vereniging →
        </Link>
      </p>
    </div>
  );
}
