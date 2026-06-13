import Link from 'next/link';
import {
  Clock,
  Rocket,
  Swords,
  Target,
  Trophy,
  Tv,
  UserPlus,
  Flame,
} from 'lucide-react';

const actions = [
  {
    href: '/log?type=speeltijd',
    label: 'Speeltijd',
    sub: '+10',
    icon: Clock,
    color: 'bg-teal-500',
  },
  {
    href: '/log?type=spelen',
    label: 'Wedstrijd',
    sub: '+10',
    icon: Target,
    color: 'bg-sky-500',
  },
  {
    href: '/spelers',
    label: 'Uitdagen',
    sub: '+30',
    icon: Swords,
    color: 'bg-amber-500',
  },
  {
    href: '/log?type=uitdaging',
    label: 'Uitdaging',
    sub: '+30',
    icon: Rocket,
    color: 'bg-emerald-500',
  },
  {
    href: '/log?type=sociaal',
    label: 'Sociaal',
    sub: '+5',
    icon: Tv,
    color: 'bg-indigo-500',
  },
  {
    href: '/log?type=nieuwe_tegenstander',
    label: 'Nieuwe speler',
    sub: '+25',
    icon: UserPlus,
    color: 'bg-orange-500',
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {actions.map(({ href, label, sub, icon: Icon, color }) => (
        <Link
          key={href + label}
          href={href}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-100 bg-white p-3 text-center transition-all hover:border-tof-teal/40 hover:shadow-md"
        >
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105 ${color}`}
          >
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-xs font-bold text-tof-navy">{label}</span>
          <span className="text-[10px] font-bold text-tof-teal">{sub} pts</span>
        </Link>
      ))}
    </div>
  );
}

export function PointsLegend() {
  const items = [
    { label: 'Spelen', pts: '+10', icon: Target },
    { label: 'Deelnemen', pts: '+15', icon: Trophy },
    { label: 'Uitdaging', pts: '+30', icon: Rocket },
    { label: 'Nieuwe speler', pts: '+25', icon: UserPlus },
    { label: 'Reeks (automatisch)', pts: '+20/dag', icon: Flame, auto: true },
  ];

  return (
    <div className="tof-card tof-card-body">
      <h3 className="text-sm font-bold text-tof-navy">TOF Social Score — punten voor</h3>
      <ul className="mt-3 space-y-2">
        {items.map(({ label, pts, icon: Icon, auto }) => (
          <li key={label} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-gray-700">
              <Icon className={`h-4 w-4 ${auto ? 'text-orange-400' : 'text-tof-teal'}`} />
              {label}
            </span>
            <span className="font-bold text-tof-navy">{pts}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-gray-500">
        Reeks telt vanzelf — log elke 24 uur een activiteit.
      </p>
    </div>
  );
}
