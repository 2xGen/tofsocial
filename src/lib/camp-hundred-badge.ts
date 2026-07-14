export function getHundredBadgeTier(totalPoints: number): number | null {
  if (totalPoints < 100) return null;
  return Math.floor(totalPoints / 100) * 100;
}

const TIER_STYLES = [
  'bg-amber-400 text-amber-950',
  'bg-tof-teal text-tof-navy',
  'bg-violet-500 text-white',
  'bg-rose-500 text-white',
  'bg-sky-600 text-white',
  'bg-emerald-600 text-white',
  'bg-orange-500 text-white',
  'bg-fuchsia-600 text-white',
  'bg-tof-navy text-white',
];

export function getHundredBadgeStyle(tier: number): string {
  const index = tier / 100 - 1;
  return TIER_STYLES[index % TIER_STYLES.length];
}
