export type CampId = 'tof' | 'shot';
export type CampSlug = 'tof-kamp' | 'shot-kamp';

export type CampConfig = (typeof CAMPS)[CampId];

export const CAMPS = {
  tof: {
    id: 'tof' as const,
    slug: 'tof-kamp' as const,
    name: 'TOF',
    label: 'TOF Social · Tenniskamp',
    shortLabel: 'Tenniskamp',
    trainers: [
      'Remco',
      'Stefan',
      'Jort',
      'Matthijs',
      'Floor',
      'Liv',
      'Sem',
      'Angelique',
    ] as const,
  },
  shot: {
    id: 'shot' as const,
    slug: 'shot-kamp' as const,
    name: 'SHOT',
    label: 'SHOT · Tenniskamp',
    shortLabel: 'SHOT Tenniskamp',
    trainers: [
      'Henriette',
      'Danny',
      'Harry',
      'Sander',
      'Mirjam',
      'Jeroen',
      'Jay',
    ] as const,
  },
};

const SLUG_TO_CAMP: Record<CampSlug, CampConfig> = {
  'tof-kamp': CAMPS.tof,
  'shot-kamp': CAMPS.shot,
};

export function isCampSlug(slug: string): slug is CampSlug {
  return slug === 'tof-kamp' || slug === 'shot-kamp';
}

export function getCampBySlug(slug: string): CampConfig | null {
  if (!isCampSlug(slug)) return null;
  return SLUG_TO_CAMP[slug];
}

export function campBasePath(campId: CampId): `/${CampSlug}` {
  return `/${CAMPS[campId].slug}`;
}

export function getCampTrainers(campId: CampId): readonly string[] {
  return CAMPS[campId].trainers;
}
