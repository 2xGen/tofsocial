import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin } from 'lucide-react';

const LOGO_SRC =
  'https://toftennis.nl/wp-content/uploads/2024/04/TOF-logo.svg';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-tof-navy text-white">
      <div className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <Image
                src={LOGO_SRC}
                alt="TOF"
                width={140}
                height={48}
                className="h-10 w-auto brightness-0 invert"
              />
              <span className="pb-1 text-base font-bold leading-none text-white md:text-lg">
                Social
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/70">
              Voor het jeugdprogramma van tennis- en padelverenigingen. Maak
              activiteit zichtbaar en jeugdspelers actiever op de club.
            </p>
          </div>

          <div>
            <h3 className="mb-4 font-bold">Functies</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <a href="#activiteiten" className="hover:text-tof-teal">
                  Activiteiten
                </a>
              </li>
              <li>
                <a href="#hoe-het-werkt" className="hover:text-tof-teal">
                  Hoe het werkt
                </a>
              </li>
              <li>
                <a href="#score" className="hover:text-tof-teal">
                  TOF Social Score
                </a>
              </li>
              <li>
                <a href="#uitdagingen" className="hover:text-tof-teal">
                  Uitdagingen
                </a>
              </li>
              <li>
                <a href="#jeugd" className="hover:text-tof-teal">
                  Voor jeugd
                </a>
              </li>
              <li>
                <a href="#trainers" className="hover:text-tof-teal">
                  Voor trainers
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-bold">Contact</h3>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-tof-teal" />
                <a href="mailto:info@toftennis.nl" className="hover:text-tof-teal">
                  info@toftennis.nl
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tof-teal" />
                <span>Nederland</span>
              </li>
            </ul>
            <Link
              href="https://toftennis.nl"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-semibold text-tof-teal hover:underline"
            >
              toftennis.nl →
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {year} TOF Social · Onderdeel van TOF Sports
        </div>
      </div>
    </footer>
  );
}
