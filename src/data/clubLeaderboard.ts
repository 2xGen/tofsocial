export interface ClubLeaderboardEntry {
  id: string;
  name: string;
  city: string;
  sports: ('tennis' | 'padel')[];
  totalMembers: number;
  /** Spelers met minstens één melding deze week */
  activeMembers: number;
  totalScore: number;
}

/** Rangschikking: gemiddelde weekly score per actieve speler — niet totaal leden. */
export function scorePerActiveMember(club: ClubLeaderboardEntry): number {
  if (club.activeMembers === 0) return 0;
  return Math.round((club.totalScore / club.activeMembers) * 10) / 10;
}

export function activeMemberRate(club: ClubLeaderboardEntry): number {
  if (club.totalMembers === 0) return 0;
  return Math.round((club.activeMembers / club.totalMembers) * 100);
}

const CLUBS: ClubLeaderboardEntry[] = [
  {
    id: '1',
    name: 'Padel Club Amstelveen',
    city: 'Amstelveen',
    sports: ['padel'],
    totalMembers: 34,
    activeMembers: 31,
    totalScore: 1480,
  },
  {
    id: '2',
    name: 'TC De Smash',
    city: 'Utrecht',
    sports: ['tennis', 'padel'],
    totalMembers: 86,
    activeMembers: 64,
    totalScore: 2140,
  },
  {
    id: '3',
    name: 'TV Het Twiske',
    city: 'Oostzaan',
    sports: ['tennis'],
    totalMembers: 52,
    activeMembers: 41,
    totalScore: 1270,
  },
  {
    id: '4',
    name: 'Padel & Tennis Delft',
    city: 'Delft',
    sports: ['tennis', 'padel'],
    totalMembers: 118,
    activeMembers: 62,
    totalScore: 1860,
  },
  {
    id: '5',
    name: 'TC Sloten',
    city: 'Amsterdam',
    sports: ['tennis'],
    totalMembers: 94,
    activeMembers: 38,
    totalScore: 1020,
  },
  {
    id: '6',
    name: 'Smash Padel Rotterdam',
    city: 'Rotterdam',
    sports: ['padel'],
    totalMembers: 48,
    activeMembers: 35,
    totalScore: 1190,
  },
  {
    id: '7',
    name: 'TC Zeewolde',
    city: 'Zeewolde',
    sports: ['tennis'],
    totalMembers: 41,
    activeMembers: 33,
    totalScore: 990,
  },
  {
    id: '8',
    name: 'Urban Padel Eindhoven',
    city: 'Eindhoven',
    sports: ['padel'],
    totalMembers: 72,
    activeMembers: 44,
    totalScore: 1320,
  },
];

export function getRankedClubs(): (ClubLeaderboardEntry & {
  rank: number;
  avgPerActive: number;
  activeRate: number;
})[] {
  return [...CLUBS]
    .sort((a, b) => scorePerActiveMember(b) - scorePerActiveMember(a))
    .map((club, index) => ({
      ...club,
      rank: index + 1,
      avgPerActive: scorePerActiveMember(club),
      activeRate: activeMemberRate(club),
    }));
}
