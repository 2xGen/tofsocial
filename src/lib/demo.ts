import type { ActivityType } from '@/types';
import type { IconName } from '@/lib/icons';

export const ACTIVITY_ICON: Record<ActivityType, IconName> = {
  spelen: 'match',
  deelnemen: 'activity',
  uitdaging: 'challenge',
  nieuwe_tegenstander: 'new',
  consistentie: 'streak',
  speeltijd: 'time',
  sociaal: 'partners',
  uitdaging_speler: 'challenge',
};

export const ACTIVITY_COLOR: Record<ActivityType, string> = {
  spelen: 'bg-sky-500',
  deelnemen: 'bg-violet-500',
  uitdaging: 'bg-emerald-500',
  nieuwe_tegenstander: 'bg-orange-500',
  consistentie: 'bg-rose-500',
  speeltijd: 'bg-teal-500',
  sociaal: 'bg-indigo-500',
  uitdaging_speler: 'bg-amber-500',
};

export const DEMO_PLAYER = {
  id: 'demo-emma',
  name: 'Emma',
  weeklyPoints: 80,
  streak: 3,
  rank: 2,
  sportFocus: 'beide' as const,
};

export const DEMO_MEMBERS = [
  { id: '1', name: 'Emma', weeklyPoints: 80, rank: 2 },
  { id: '2', name: 'Finn', weeklyPoints: 65, rank: 3 },
  { id: '3', name: 'Lisa', weeklyPoints: 92, rank: 1 },
  { id: '4', name: 'Noah', weeklyPoints: 54, rank: 4 },
  { id: '5', name: 'Sam', weeklyPoints: 38, rank: 5 },
];

export const DEMO_CHALLENGES = [
  { id: 'c1', title: 'Speel 3 wedstrijden deze week', progress: 2, total: 3, points: 30 },
  { id: 'c2', title: 'Speel tegen een nieuwe tegenstander', progress: 0, total: 1, points: 25 },
  { id: 'c3', title: 'Maak 5 uur op de baan vol', progress: 3.5, total: 5, points: 30, unit: 'uur' },
];

export const DEMO_PAGES = [
  '/verenigingen',
  '/vereniging',
  '/profiel',
  '/instellingen',
  '/log',
  '/spelers',
  '/feed',
  '/dashboard',
];
