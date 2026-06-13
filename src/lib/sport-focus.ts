import type { Club, PlayerSportFocus, Sport } from '@/types';

const DEMO_SPORT_FOCUS_KEY = 'tof-social-demo-sport-focus';

export function getAvailableLogSports(
  clubSport: Club['sport'],
  playerFocus: PlayerSportFocus
): Sport[] {
  if (clubSport === 'tennis') return ['tennis'];
  if (clubSport === 'padel') return ['padel'];
  if (playerFocus === 'tennis') return ['tennis'];
  if (playerFocus === 'padel') return ['padel'];
  return ['tennis', 'padel'];
}

export function resolveDefaultSport(
  clubSport: Club['sport'],
  playerFocus: PlayerSportFocus
): Sport {
  return getAvailableLogSports(clubSport, playerFocus)[0];
}

export function getDemoSportFocus(): PlayerSportFocus {
  if (typeof window === 'undefined') return 'beide';
  const stored = localStorage.getItem(DEMO_SPORT_FOCUS_KEY);
  if (stored === 'tennis' || stored === 'padel' || stored === 'beide') return stored;
  return 'beide';
}

export function setDemoSportFocus(focus: PlayerSportFocus) {
  localStorage.setItem(DEMO_SPORT_FOCUS_KEY, focus);
}

export function activityNeedsSport(type: string): boolean {
  return type !== 'sociaal';
}
