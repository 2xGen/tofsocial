import type {
  CampChallenge,
  CampDay,
  CampFeedEntry,
  CampPlayer,
  CampPointAmount,
  CampStore,
  CampTrainer,
  SpecialCategory,
} from '@/types/camp';
import { SPECIAL_POINTS } from '@/types/camp';
import { createDefaultCampPlayers } from '@/data/campPlayers';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const STORAGE_KEY = 'tof-social-camp';
const TRAINER_KEY = 'tof-social-camp-trainer';

// ─── localStorage fallback ───────────────────────────────────────────────────

function generateId() {
  return crypto.randomUUID();
}

function defaultStore(): CampStore {
  return {
    players: createDefaultCampPlayers(),
    challenges: [],
    feed: [],
    activeDay: 'ma',
  };
}

function readLocalStore(): CampStore {
  if (typeof window === 'undefined') return defaultStore();
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const store = defaultStore();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return store;
  }
  const parsed = JSON.parse(raw) as CampStore;
  if (parsed.players.length === 0) parsed.players = createDefaultCampPlayers();
  return parsed;
}

function writeLocalStore(store: CampStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

// ─── Supabase row mappers ────────────────────────────────────────────────────

type DbPlayer = {
  id: string;
  full_name: string;
  nickname: string;
  group_id: number | null;
};

type DbChallenge = {
  id: string;
  name: string;
  points: number;
  created_at: string;
};

type DbFeed = {
  id: string;
  day: CampDay;
  trainer: string;
  type: CampFeedEntry['type'];
  target_type: CampFeedEntry['targetType'];
  player_id: string | null;
  group_id: number | null;
  points: number;
  challenge_id: string | null;
  challenge_name: string | null;
  special_category: SpecialCategory | null;
  description: string;
  created_at: string;
};

function mapPlayer(row: DbPlayer): CampPlayer {
  return {
    id: row.id,
    fullName: row.full_name,
    nickname: row.nickname,
    groupId: row.group_id,
  };
}

function mapChallenge(row: DbChallenge): CampChallenge {
  return {
    id: row.id,
    name: row.name,
    points: row.points as CampPointAmount,
    createdAt: row.created_at,
  };
}

function mapFeed(row: DbFeed): CampFeedEntry {
  return {
    id: row.id,
    day: row.day,
    trainer: row.trainer,
    type: row.type,
    targetType: row.target_type,
    playerId: row.player_id ?? undefined,
    groupId: row.group_id ?? undefined,
    points: row.points,
    challengeId: row.challenge_id ?? undefined,
    challengeName: row.challenge_name ?? undefined,
    specialCategory: row.special_category ?? undefined,
    description: row.description,
    createdAt: row.created_at,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Set false when Supabase tables are missing so we fall back to localStorage. */
let campSupabaseReady: boolean | null = null;

function isSupabaseUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const e = error as { code?: string; message?: string; status?: number; statusCode?: number };
  const status = e.status ?? e.statusCode;
  if (status === 404) return true;
  if (e.code === 'PGRST205' || e.code === '42P01') return true;
  const msg = (e.message ?? '').toLowerCase();
  return msg.includes('could not find the table') || msg.includes('does not exist');
}

function markSupabaseUnavailable(error: unknown): boolean {
  if (!isSupabaseUnavailableError(error)) return false;
  campSupabaseReady = false;
  return true;
}

function shouldUseSupabase(): boolean {
  return usesSupabase() && campSupabaseReady !== false;
}

export function usesCampRealtime(): boolean {
  return shouldUseSupabase();
}

export function usesSupabase(): boolean {
  return typeof window !== 'undefined' && isSupabaseConfigured();
}

export async function getCampStore(): Promise<CampStore> {
  if (!shouldUseSupabase()) return readLocalStore();

  try {
    const supabase = createClient();
    const [playersRes, challengesRes, feedRes, settingsRes] = await Promise.all([
      supabase.from('camp_players').select('*').order('nickname'),
      supabase.from('camp_challenges').select('*').order('created_at', { ascending: false }),
      supabase.from('camp_feed').select('*').order('created_at', { ascending: false }),
      supabase.from('camp_settings').select('active_day').eq('id', 1).maybeSingle(),
    ]);

    if (playersRes.error) {
      if (markSupabaseUnavailable(playersRes.error)) return readLocalStore();
      throw playersRes.error;
    }

    campSupabaseReady = true;
    return {
      players: (playersRes.data as DbPlayer[]).map(mapPlayer),
      challenges: ((challengesRes.data ?? []) as DbChallenge[]).map(mapChallenge),
      feed: ((feedRes.data ?? []) as DbFeed[]).map(mapFeed),
      activeDay: (settingsRes.data?.active_day as CampDay) ?? 'ma',
    };
  } catch (error) {
    if (markSupabaseUnavailable(error)) return readLocalStore();
    throw error;
  }
}

export async function setActiveCampDay(day: CampDay): Promise<void> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore();
    store.activeDay = day;
    writeLocalStore(store);
    return;
  }
  const { error } = await createClient()
    .from('camp_settings')
    .upsert({ id: 1, active_day: day });
  if (error) {
    if (markSupabaseUnavailable(error)) {
      const store = readLocalStore();
      store.activeDay = day;
      writeLocalStore(store);
      return;
    }
    throw error;
  }
}

export async function setPlayerGroup(playerId: string, groupId: number | null): Promise<void> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore();
    const player = store.players.find((p) => p.id === playerId);
    if (player) player.groupId = groupId;
    writeLocalStore(store);
    return;
  }
  const { error } = await createClient()
    .from('camp_players')
    .update({ group_id: groupId })
    .eq('id', playerId);
  if (error) {
    if (markSupabaseUnavailable(error)) {
      const store = readLocalStore();
      const player = store.players.find((p) => p.id === playerId);
      if (player) player.groupId = groupId;
      writeLocalStore(store);
      return;
    }
    throw error;
  }
}

export async function getCampPlayers(): Promise<CampPlayer[]> {
  const store = await getCampStore();
  return store.players.sort((a, b) => a.nickname.localeCompare(b.nickname, 'nl'));
}

export async function createCampChallenge(
  name: string,
  points: CampPointAmount
): Promise<CampChallenge> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore();
    const challenge: CampChallenge = {
      id: generateId(),
      name: name.trim(),
      points,
      createdAt: new Date().toISOString(),
    };
    store.challenges.unshift(challenge);
    writeLocalStore(store);
    return challenge;
  }
  const { data, error } = await createClient()
    .from('camp_challenges')
    .insert({ name: name.trim(), points })
    .select()
    .single();
  if (error) {
    if (markSupabaseUnavailable(error)) return createCampChallenge(name, points);
    throw error;
  }
  return mapChallenge(data as DbChallenge);
}

export async function getCampChallenges(): Promise<CampChallenge[]> {
  const store = await getCampStore();
  return store.challenges;
}

async function insertFeedEntry(
  entry: Omit<CampFeedEntry, 'id' | 'createdAt'>
): Promise<CampFeedEntry> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore();
    const full: CampFeedEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    store.feed.unshift(full);
    writeLocalStore(store);
    return full;
  }
  const { data, error } = await createClient()
    .from('camp_feed')
    .insert({
      day: entry.day,
      trainer: entry.trainer,
      type: entry.type,
      target_type: entry.targetType,
      player_id: entry.playerId ?? null,
      group_id: entry.groupId ?? null,
      points: entry.points,
      challenge_id: entry.challengeId ?? null,
      challenge_name: entry.challengeName ?? null,
      special_category: entry.specialCategory ?? null,
      description: entry.description,
    })
    .select()
    .single();
  if (error) {
    if (markSupabaseUnavailable(error)) return insertFeedEntry(entry);
    throw error;
  }
  return mapFeed(data as DbFeed);
}

export async function awardPointsToPlayer(input: {
  day: CampDay;
  trainer: CampTrainer;
  playerId: string;
  points: number;
  description: string;
  challengeId?: string;
  challengeName?: string;
}): Promise<CampFeedEntry> {
  return insertFeedEntry({
    day: input.day,
    trainer: input.trainer,
    type: input.challengeId ? 'challenge' : 'points',
    targetType: 'player',
    playerId: input.playerId,
    points: input.points,
    challengeId: input.challengeId,
    challengeName: input.challengeName,
    description: input.description.trim(),
  });
}

export async function awardPointsToGroup(input: {
  day: CampDay;
  trainer: CampTrainer;
  groupId: number;
  points: number;
  description: string;
  challengeId?: string;
  challengeName?: string;
}): Promise<CampFeedEntry> {
  const players = await getCampPlayers();
  const members = players.filter((p) => p.groupId === input.groupId);
  return insertFeedEntry({
    day: input.day,
    trainer: input.trainer,
    type: input.challengeId ? 'challenge' : 'points',
    targetType: 'group',
    groupId: input.groupId,
    playerIds: members.map((p) => p.id),
    points: input.points,
    challengeId: input.challengeId,
    challengeName: input.challengeName,
    description: input.description.trim(),
  });
}

export async function awardSpecialToPlayer(input: {
  day: CampDay;
  trainer: CampTrainer;
  playerId: string;
  category: SpecialCategory;
  description?: string;
}): Promise<CampFeedEntry> {
  return insertFeedEntry({
    day: input.day,
    trainer: input.trainer,
    type: 'special',
    targetType: 'player',
    playerId: input.playerId,
    points: SPECIAL_POINTS,
    specialCategory: input.category,
    description: input.description?.trim() || '',
  });
}

export async function getCampFeed(limit?: number): Promise<CampFeedEntry[]> {
  if (!shouldUseSupabase()) {
    const feed = readLocalStore().feed;
    return limit ? feed.slice(0, limit) : feed;
  }
  try {
    let query = createClient()
      .from('camp_feed')
      .select('*')
      .order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      if (markSupabaseUnavailable(error)) {
        const feed = readLocalStore().feed;
        return limit ? feed.slice(0, limit) : feed;
      }
      throw error;
    }
    return ((data ?? []) as DbFeed[]).map(mapFeed);
  } catch (error) {
    if (markSupabaseUnavailable(error)) {
      const feed = readLocalStore().feed;
      return limit ? feed.slice(0, limit) : feed;
    }
    throw error;
  }
}

export async function deleteCampFeedEntry(id: string): Promise<void> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore();
    store.feed = store.feed.filter((e) => e.id !== id);
    writeLocalStore(store);
    return;
  }
  const { error } = await createClient().from('camp_feed').delete().eq('id', id);
  if (error) {
    if (markSupabaseUnavailable(error)) {
      const store = readLocalStore();
      store.feed = store.feed.filter((e) => e.id !== id);
      writeLocalStore(store);
      return;
    }
    throw error;
  }
}

export interface PlayerDayStats {
  playerId: string;
  nickname: string;
  groupId: number | null;
  totalPoints: number;
  fair_play: number;
  respect: number;
  samenwerking: number;
  inzet: number;
}

function applyEntryToStats(s: PlayerDayStats, entry: CampFeedEntry) {
  s.totalPoints += entry.points;
  if (entry.specialCategory) s[entry.specialCategory] += 1;
}

export async function computePlayerStats(day?: CampDay): Promise<PlayerDayStats[]> {
  const store = await getCampStore();
  const feed = day ? store.feed.filter((e) => e.day === day) : store.feed;

  const statsMap = new Map<string, PlayerDayStats>();
  for (const player of store.players) {
    statsMap.set(player.id, {
      playerId: player.id,
      nickname: player.nickname,
      groupId: player.groupId,
      totalPoints: 0,
      fair_play: 0,
      respect: 0,
      samenwerking: 0,
      inzet: 0,
    });
  }

  for (const entry of feed) {
    if (entry.targetType === 'player' && entry.playerId) {
      const s = statsMap.get(entry.playerId);
      if (s) applyEntryToStats(s, entry);
    } else if (entry.targetType === 'group' && entry.groupId) {
      for (const m of store.players.filter((p) => p.groupId === entry.groupId)) {
        const s = statsMap.get(m.id);
        if (s) applyEntryToStats(s, entry);
      }
    }
  }

  return Array.from(statsMap.values());
}

export interface GroupDayStats {
  groupId: number;
  totalPoints: number;
  memberCount: number;
  fair_play: number;
  respect: number;
  samenwerking: number;
  inzet: number;
}

export async function computeGroupStats(day?: CampDay): Promise<GroupDayStats[]> {
  const playerStats = await computePlayerStats(day);
  const groups: GroupDayStats[] = [];

  for (let g = 1; g <= 9; g++) {
    const members = playerStats.filter((p) => p.groupId === g);
    groups.push({
      groupId: g,
      memberCount: members.length,
      totalPoints: members.reduce((sum, m) => sum + m.totalPoints, 0),
      fair_play: members.reduce((sum, m) => sum + m.fair_play, 0),
      respect: members.reduce((sum, m) => sum + m.respect, 0),
      samenwerking: members.reduce((sum, m) => sum + m.samenwerking, 0),
      inzet: members.reduce((sum, m) => sum + m.inzet, 0),
    });
  }

  return groups.sort((a, b) => b.totalPoints - a.totalPoints);
}

export async function getPlayerOfDay(day: CampDay): Promise<PlayerDayStats | null> {
  const stats = (await computePlayerStats(day))
    .filter((s) => s.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);
  return stats[0] ?? null;
}

export async function getTopPlayers(day: CampDay, limit = 5): Promise<PlayerDayStats[]> {
  return (await computePlayerStats(day))
    .filter((s) => s.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

export async function getTopBySpecial(
  category: SpecialCategory,
  day?: CampDay,
  limit = 5
): Promise<PlayerDayStats[]> {
  return (await computePlayerStats(day))
    .filter((s) => s[category] > 0)
    .sort((a, b) => b[category] - a[category])
    .slice(0, limit);
}

export function getTrainerSession(): CampTrainer | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(TRAINER_KEY);
  return v as CampTrainer | null;
}

export function setTrainerSession(trainer: CampTrainer) {
  localStorage.setItem(TRAINER_KEY, trainer);
}

let nicknameCache: Map<string, string> = new Map();

export async function getPlayerNickname(playerId: string): Promise<string> {
  if (nicknameCache.has(playerId)) return nicknameCache.get(playerId)!;
  const players = await getCampPlayers();
  nicknameCache = new Map(players.map((p) => [p.id, p.nickname]));
  return nicknameCache.get(playerId) ?? '?';
}

export function subscribeCampFeed(onChange: () => void): () => void {
  if (!shouldUseSupabase()) return () => undefined;

  try {
    const supabase = createClient();
    const channel = supabase
      .channel('camp-feed-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'camp_feed' }, () =>
        onChange()
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'camp_players' }, () =>
        onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => undefined;
  }
}
