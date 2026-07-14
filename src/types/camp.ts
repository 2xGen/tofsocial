export type CampDay = 'ma' | 'di' | 'wo' | 'do';

export type SpecialCategory = 'fair_play' | 'respect' | 'samenwerking' | 'inzet';

export type CampPointAmount = 5 | 10 | 15 | 20;

export interface CampPlayer {
  id: string;
  fullName: string;
  nickname: string;
  groupId: number | null;
}

export interface CampChallenge {
  id: string;
  name: string;
  points: CampPointAmount;
  createdAt: string;
}

export interface CampFeedEntry {
  id: string;
  day: CampDay;
  trainer: string;
  type: 'points' | 'challenge' | 'special';
  targetType: 'player' | 'group';
  playerId?: string;
  playerIds?: string[];
  groupId?: number;
  points: number;
  challengeId?: string;
  challengeName?: string;
  specialCategory?: SpecialCategory;
  description: string;
  createdAt: string;
}

export interface CampStore {
  players: CampPlayer[];
  challenges: CampChallenge[];
  feed: CampFeedEntry[];
  activeDay: CampDay;
}

export const CAMP_DAYS: { id: CampDay; label: string }[] = [
  { id: 'ma', label: 'Maandag' },
  { id: 'di', label: 'Dinsdag' },
  { id: 'wo', label: 'Woensdag' },
  { id: 'do', label: 'Donderdag' },
];

export const CAMP_TRAINERS = [
  'Remco',
  'Stefan',
  'Jort',
  'Matthijs',
  'Floor',
  'Sem',
  'Angelique',
] as const;

export type CampTrainer = (typeof CAMP_TRAINERS)[number];

export const SPECIAL_CATEGORIES: {
  id: SpecialCategory;
  label: string;
}[] = [
  { id: 'fair_play', label: 'Fair play' },
  { id: 'respect', label: 'Respect' },
  { id: 'samenwerking', label: 'Samenwerking' },
  { id: 'inzet', label: 'Inzet' },
];

export const POINT_OPTIONS: CampPointAmount[] = [5, 10, 15, 20];

export const GROUP_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Special badge = +5 punten per toekenning */
export const SPECIAL_POINTS = 5;

export const SPECIAL_LABELS: Record<SpecialCategory, string> = {
  fair_play: 'Fair play',
  respect: 'Respect',
  samenwerking: 'Samenwerking',
  inzet: 'Inzet',
};
