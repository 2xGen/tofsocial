import type {
  Activity,
  ActivityType,
  Club,
  DataStore,
  JoinRequest,
  PlayerSportFocus,
  Sport,
  User,
} from '@/types';
import { ACTIVITY_POINTS } from '@/types';
import { resolveDefaultSport } from '@/lib/sport-focus';

const STORAGE_KEY = 'tof-social-data';
const SESSION_KEY = 'tof-social-session';

function generateId() {
  return crypto.randomUUID();
}

function generateJoinCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CLUB-';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function defaultStore(): DataStore {
  return {
    tofInviteCodes: [{ code: 'TOF-DEMO', used: false }],
    clubs: [],
    users: [],
    activities: [],
    joinRequests: [],
  };
}

function readStore(): DataStore {
  if (typeof window === 'undefined') return defaultStore();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const store = defaultStore();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return store;
  }
  return JSON.parse(raw) as DataStore;
}

function writeStore(store: DataStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getSessionUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(userId: string | null) {
  if (userId) localStorage.setItem(SESSION_KEY, userId);
  else localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  const id = getSessionUserId();
  if (!id) return null;
  return readStore().users.find((u) => u.id === id) ?? null;
}

export function getClub(clubId: string): Club | null {
  return readStore().clubs.find((c) => c.id === clubId) ?? null;
}

export function login(email: string, password: string): User {
  const store = readStore();
  const user = store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!user) throw new Error('Onjuist e-mailadres of wachtwoord.');
  setSession(user.id);
  return user;
}

export function logout() {
  setSession(null);
}

export function registerClub(input: {
  tofCode: string;
  clubName: string;
  sport: Club['sport'];
  adminName: string;
  email: string;
  password: string;
}): { user: User; club: Club } {
  const store = readStore();

  const invite = store.tofInviteCodes.find(
    (c) => c.code.toUpperCase() === input.tofCode.toUpperCase()
  );
  if (!invite) throw new Error('Ongeldige TOF-code. Vraag een code aan bij TOF.');
  if (invite.used) throw new Error('Deze TOF-code is al gebruikt.');

  if (store.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Dit e-mailadres is al geregistreerd.');
  }

  const userId = generateId();
  const clubId = generateId();
  const joinCode = generateJoinCode();

  const user: User = {
    id: userId,
    email: input.email,
    password: input.password,
    name: input.adminName,
    role: 'club_admin',
    clubId,
    createdAt: new Date().toISOString(),
  };

  const club: Club = {
    id: clubId,
    name: input.clubName,
    sport: input.sport,
    tofInviteCode: invite.code,
    joinCode,
    adminUserId: userId,
    createdAt: new Date().toISOString(),
  };

  invite.used = true;
  invite.usedByClubId = clubId;
  store.users.push(user);
  store.clubs.push(club);
  writeStore(store);
  setSession(userId);

  return { user, club };
}

export function registerPlayer(input: {
  joinCode: string;
  name: string;
  email: string;
  password: string;
  sportFocus?: PlayerSportFocus;
}): User {
  const store = readStore();

  const club = store.clubs.find(
    (c) => c.joinCode.toUpperCase() === input.joinCode.toUpperCase()
  );
  if (!club) throw new Error('Ongeldige clubcode. Vraag de code aan je vereniging.');

  if (store.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Dit e-mailadres is al geregistreerd.');
  }

  const user: User = {
    id: generateId(),
    email: input.email,
    password: input.password,
    name: input.name,
    role: 'player',
    clubId: club.id,
    sportFocus: input.sportFocus ?? 'beide',
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  writeStore(store);
  setSession(user.id);

  return user;
}

export function logActivity(input: {
  userId: string;
  type: ActivityType;
  description: string;
  sport?: Sport;
}): Activity {
  const store = readStore();
  const user = store.users.find((u) => u.id === input.userId);
  if (!user?.clubId) throw new Error('Geen vereniging gekoppeld.');

  const club = store.clubs.find((c) => c.id === user.clubId);
  const clubSport = club?.sport ?? 'beide';
  const playerFocus = user.sportFocus ?? 'beide';
  const sport =
    input.sport ?? resolveDefaultSport(clubSport, playerFocus);

  const activity: Activity = {
    id: generateId(),
    userId: user.id,
    userName: user.name,
    clubId: user.clubId,
    type: input.type,
    description: input.description,
    points: ACTIVITY_POINTS[input.type],
    sport,
    createdAt: new Date().toISOString(),
  };

  store.activities.unshift(activity);
  writeStore(store);
  return activity;
}

export function getClubActivities(clubId: string): Activity[] {
  return readStore()
    .activities.filter((a) => a.clubId === clubId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getClubMembers(clubId: string): User[] {
  return readStore().users.filter((u) => u.clubId === clubId);
}

export function getUserWeeklyPoints(userId: string): number {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return readStore()
    .activities.filter(
      (a) => a.userId === userId && new Date(a.createdAt).getTime() > weekAgo
    )
    .reduce((sum, a) => sum + a.points, 0);
}

export function getClubJoinRequests(clubId: string): JoinRequest[] {
  return readStore().joinRequests.filter((r) => r.clubId === clubId);
}

export function requestJoinClub(input: {
  joinCode: string;
  name: string;
  email: string;
  password: string;
  sportFocus?: PlayerSportFocus;
}): JoinRequest {
  const store = readStore();
  const club = store.clubs.find(
    (c) => c.joinCode.toUpperCase() === input.joinCode.toUpperCase()
  );
  if (!club) throw new Error('Ongeldige clubcode.');

  if (store.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error('Dit e-mailadres is al geregistreerd.');
  }

  const user: User = {
    id: generateId(),
    email: input.email,
    password: input.password,
    name: input.name,
    role: 'player',
    clubId: null,
    sportFocus: input.sportFocus ?? 'beide',
    createdAt: new Date().toISOString(),
  };

  const request: JoinRequest = {
    id: generateId(),
    userId: user.id,
    userName: user.name,
    clubId: club.id,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  store.users.push(user);
  store.joinRequests.push(request);
  writeStore(store);
  setSession(user.id);

  return request;
}

export function approveJoinRequest(requestId: string): void {
  const store = readStore();
  const request = store.joinRequests.find((r) => r.id === requestId);
  if (!request) throw new Error('Aanvraag niet gevonden.');

  const user = store.users.find((u) => u.id === request.userId);
  if (!user) throw new Error('Speler niet gevonden.');

  request.status = 'approved';
  user.clubId = request.clubId;
  writeStore(store);
}

export function updatePlayerSportFocus(
  userId: string,
  sportFocus: PlayerSportFocus
): User {
  const store = readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) throw new Error('Speler niet gevonden.');

  user.sportFocus = sportFocus;
  writeStore(store);
  return user;
}
