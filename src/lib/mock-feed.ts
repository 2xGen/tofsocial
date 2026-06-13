import { activityFeed } from '@/data/mockData';
import type { Activity } from '@/types';

const MOCK_POINTS: Record<string, number> = {
  time: 10,
  match: 10,
  social: 15,
  challenge: 30,
  activity: 15,
  streak: 20,
};

const MOCK_TYPE_MAP: Record<string, Activity['type']> = {
  time: 'speeltijd',
  match: 'spelen',
  social: 'deelnemen',
  challenge: 'uitdaging',
  activity: 'deelnemen',
  streak: 'consistentie',
};

export const MOCK_CLUB_NAME = 'TC De Smash';

export function getMockFeedActivities(): Activity[] {
  const now = Date.now();
  return activityFeed.map((item, index) => ({
    id: `mock-${index}`,
    userId: `mock-user-${index}`,
    userName: item.user,
    clubId: 'mock-club',
    type: MOCK_TYPE_MAP[item.type] ?? 'spelen',
    description: item.action,
    points: MOCK_POINTS[item.type] ?? 10,
    sport: item.sport,
    createdAt: new Date(now - (index + 1) * 12 * 60 * 1000).toISOString(),
  }));
}

export function getMockFeedTimestamps(): string[] {
  return activityFeed.map((item) => item.timestamp);
}
