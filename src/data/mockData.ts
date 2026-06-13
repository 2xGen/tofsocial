import type { IconName } from '@/lib/icons';

export type ActivityType = 'time' | 'match' | 'social' | 'challenge' | 'activity' | 'streak';

export interface ActivityFeedItem {
  user: string;
  action: string;
  type: ActivityType;
  sport: 'tennis' | 'padel';
  timestamp: string;
  icon: IconName;
}

export const activityFeed: ActivityFeedItem[] = [
  {
    user: 'Emma',
    action: 'speelde anderhalf uur tennis',
    type: 'time',
    sport: 'tennis',
    timestamp: '2 min geleden',
    icon: 'time',
  },
  {
    user: 'Finn',
    action: 'heeft 2 padelwedstrijden gespeeld',
    type: 'match',
    sport: 'padel',
    timestamp: '8 min geleden',
    icon: 'match',
  },
  {
    user: 'Lisa',
    action: 'speelde met 3 verschillende partners',
    type: 'social',
    sport: 'tennis',
    timestamp: '15 min geleden',
    icon: 'partners',
  },
  {
    user: 'Noah',
    action: 'is begonnen aan Kraak de Code',
    type: 'challenge',
    sport: 'padel',
    timestamp: '22 min geleden',
    icon: 'challenge',
  },
  {
    user: 'U14-ploeg',
    action: 'heeft vandaag 8 wedstrijden gespeeld',
    type: 'activity',
    sport: 'tennis',
    timestamp: '1 uur geleden',
    icon: 'activity',
  },
  {
    user: 'Noah',
    action: 'is al 3 dagen op rij actief',
    type: 'streak',
    sport: 'tennis',
    timestamp: '2 uur geleden',
    icon: 'streak',
  },
];

export const heroFeedPreview = [
  { icon: 'match' as IconName, text: 'Wedstrijd gespeeld', sub: 'Emma · 6-4, 6-3' },
  { icon: 'time' as IconName, text: '2 uur padel', sub: 'Finn · vandaag' },
  { icon: 'challenge' as IconName, text: 'Uitdaging gestart', sub: 'Lisa · Kraak de Code' },
  { icon: 'streak' as IconName, text: 'Reeks opgebouwd', sub: 'Noah · 3 dagen' },
];

export const activityTypes = [
  {
    id: 'matches',
    icon: 'match' as IconName,
    title: 'Wedstrijden',
    description: 'Resultaten en voortgang — elke wedstrijd telt mee voor je activiteit.',
    color: 'bg-sky-500',
    borderColor: 'border-sky-500',
    image:
      'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/public/TOF%20nieuwe%20fotos/tof%20500kb.jpg',
    imageAlt: 'Jeugd speelt tennis op de club',
  },
  {
    id: 'time',
    icon: 'time' as IconName,
    title: 'Tijd op de baan',
    description: 'Hoe actief iemand is — speeltijd wordt automatisch bijgehouden.',
    color: 'bg-violet-500',
    borderColor: 'border-violet-500',
    image:
      'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/public/TOF%20Sports/TOF%20Padel%20500.jpg',
    imageAlt: 'Trainer en jeugd op de padelbaan',
  },
  {
    id: 'partners',
    icon: 'partners' as IconName,
    title: 'Speelpartners',
    description: 'Met wie je speelt — ontdek nieuwe tegenstanders en vaste partners.',
    color: 'bg-teal-400',
    borderColor: 'border-teal-400',
    image:
      'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/public/TOF%20Sports/herkenbaar.jpg',
    imageAlt: 'Spelers samen op de club',
  },
  {
    id: 'challenges',
    icon: 'challenge' as IconName,
    title: 'Uitdagingen',
    description: 'Uitdagingen die spelers motiveren om vaker de baan op te gaan.',
    color: 'bg-emerald-600',
    borderColor: 'border-emerald-600',
    image:
      'https://iemgpccgdlwpsrsjuumo.supabase.co/storage/v1/object/public/TOF%20Sports/tof%20sports%20500%20kb.jpg',
    imageAlt: 'Jeugd speelt uitdagingen op de baan',
  },
];

export const scorePoints = [
  { label: 'Spelen', points: '+10', icon: 'match' as IconName },
  { label: 'Deelnemen', points: '+15', icon: 'activity' as IconName },
  { label: 'Uitdagingen', points: '+30', icon: 'challenge' as IconName },
  { label: 'Nieuwe tegenstanders', points: '+25', icon: 'new' as IconName },
  { label: 'Consistentie', points: '+20', icon: 'streak' as IconName },
];

export const problemPoints = [
  'Jeugdleden komen voor hun training en gaan weer naar huis.',
  'Er wordt weinig vrij gespeeld.',
  'Trainers moeten continu nieuwe activiteiten bedenken.',
  'Het clubgevoel onder jeugd blijft achter.',
];

export const howItWorksSteps = [
  {
    step: 1,
    title: 'Spelen',
    description:
      'Jeugdspelers spelen wedstrijden, doen uitdagingen of gaan vrij de baan op.',
    icon: 'match' as IconName,
  },
  {
    step: 2,
    title: 'Registreren',
    description: 'Activiteiten worden eenvoudig vastgelegd binnen TOF Social.',
    icon: 'activity' as IconName,
  },
  {
    step: 3,
    title: 'Verdienen',
    description: 'Spelers verdienen TOF Social Score-punten voor hun activiteit.',
    icon: 'star' as IconName,
  },
  {
    step: 4,
    title: 'Groeien',
    description:
      'Voortgang, reeksen en ranglijsten zorgen ervoor dat spelers gemotiveerd blijven.',
    icon: 'trending' as IconName,
  },
];

export const challengeExamples = [
  {
    label: 'Speel deze week 3 wedstrijden',
    icon: 'match' as IconName,
  },
  {
    label: 'Speel tegen een nieuwe tegenstander',
    icon: 'new' as IconName,
  },
  {
    label: 'Maak 5 uur op de baan vol',
    icon: 'time' as IconName,
  },
  {
    label: 'Bouw een 7-daagse reeks op',
    icon: 'streak' as IconName,
  },
];

export const youthBenefits = [
  { label: 'Hoe actief ze zijn', icon: 'trending' as IconName },
  { label: 'Hoeveel punten ze verdienen', icon: 'star' as IconName },
  { label: 'Welke uitdagingen ze hebben voltooid', icon: 'challenge' as IconName },
  { label: 'Met wie ze hebben gespeeld', icon: 'partners' as IconName },
  { label: 'Hoe ze groeien binnen de club', icon: 'trophy' as IconName },
];

export const trainerBenefits = [
  { label: 'Meer activiteit buiten de les', icon: 'activity' as IconName },
  { label: 'Minder organisatie', icon: 'time' as IconName },
  { label: 'Meer inzicht', icon: 'trending' as IconName },
  { label: 'Meer verbinding tussen spelers', icon: 'partners' as IconName },
  { label: 'Meer clubgevoel', icon: 'users' as IconName },
];

export const streakStats = [
  { label: '3-daagse reeks', value: '3', unit: 'dagen', icon: 'streak' as IconName, progress: 60 },
  { label: 'Wedstrijden deze maand', value: '10', unit: 'wedstrijden', icon: 'match' as IconName, progress: 75 },
  { label: 'Partners gespeeld', value: '5', unit: 'spelers', icon: 'partners' as IconName, progress: 50 },
  { label: 'Uitdaging voortgang', value: '68', unit: '%', icon: 'challenge' as IconName, progress: 68 },
];

export const leaderboard = [
  { rank: 1, name: 'Emma', points: 220, badge: 'star' as IconName, trend: '+42' },
  { rank: 2, name: 'Finn', points: 180, badge: 'challenge' as IconName, trend: '+35' },
  { rank: 3, name: 'Noah', points: 150, badge: 'streak' as IconName, trend: '+28' },
  { rank: 4, name: 'Lisa', points: 135, badge: 'partners' as IconName, trend: '+22' },
  { rank: 5, name: 'Sam', points: 120, badge: 'match' as IconName, trend: '+18' },
];

export const clubInsights = [
  { label: 'Gespeelde wedstrijden', value: '248', icon: 'match' as IconName, change: '+12%' },
  { label: 'Actieve spelers', value: '86', icon: 'users' as IconName, change: '+8%' },
  { label: 'Baangebruik', value: '74%', icon: 'court' as IconName, change: '+5%' },
  { label: 'Betrokkenheid', value: '91%', icon: 'trending' as IconName, change: '+3%' },
  { label: 'Inactieve spelers', value: '14', icon: 'inactive' as IconName, change: '-6%' },
];
