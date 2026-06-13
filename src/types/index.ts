export type UserRole = 'club_admin' | 'player';

export type ActivityType =
  | 'spelen'
  | 'deelnemen'
  | 'uitdaging'
  | 'nieuwe_tegenstander'
  | 'consistentie'
  | 'speeltijd'
  | 'sociaal'
  | 'uitdaging_speler';

/** Speler geeft aan waar zij op de club actief zijn — geen van beide is verplicht. */
export type PlayerSportFocus = 'tennis' | 'padel' | 'beide';

export const PLAYER_SPORT_FOCUS_LABELS: Record<PlayerSportFocus, string> = {
  tennis: 'Alleen tennis',
  padel: 'Alleen padel',
  beide: 'Tennis en padel',
};

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  clubId: string | null;
  sportFocus?: PlayerSportFocus;
  createdAt: string;
}

export interface Club {
  id: string;
  name: string;
  sport: 'tennis' | 'padel' | 'beide';
  tofInviteCode: string;
  joinCode: string;
  adminUserId: string;
  createdAt: string;
}

export type Sport = 'tennis' | 'padel';

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  clubId: string;
  type: ActivityType;
  description: string;
  points: number;
  sport: Sport;
  createdAt: string;
}

export interface JoinRequest {
  id: string;
  userId: string;
  userName: string;
  clubId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface TofInviteCode {
  code: string;
  used: boolean;
  usedByClubId?: string;
}

export interface DataStore {
  tofInviteCodes: TofInviteCode[];
  clubs: Club[];
  users: User[];
  activities: Activity[];
  joinRequests: JoinRequest[];
}

export const ACTIVITY_POINTS: Record<ActivityType, number> = {
  spelen: 10,
  deelnemen: 15,
  uitdaging: 30,
  nieuwe_tegenstander: 25,
  consistentie: 20,
  speeltijd: 10,
  sociaal: 5,
  uitdaging_speler: 30,
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  spelen: 'Spelen',
  deelnemen: 'Deelnemen',
  uitdaging: 'Uitdaging',
  nieuwe_tegenstander: 'Nieuwe tegenstander',
  consistentie: 'Consistentie',
  speeltijd: 'Speeltijd',
  sociaal: 'Sociaal',
  uitdaging_speler: 'Speler uitdagen',
};
