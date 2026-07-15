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
import { createDefaultPlayersForCamp } from '@/data/campPlayers';
import type { CampId } from '@/lib/camp-config';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const LEGACY_STORAGE_KEY = 'tof-social-camp';
const LEGACY_TRAINER_KEY = 'tof-social-camp-trainer';

function storageKey(campId: CampId) {
  return `tof-social-camp:${campId}`;
}

function trainerKey(campId: CampId) {
  return `tof-social-camp-trainer:${campId}`;
}

function generateId() {
  return crypto.randomUUID();
}

function defaultStore(campId: CampId): CampStore {
  return {
    players: createDefaultPlayersForCamp(campId),
    challenges: [],
    feed: [],
    activeDay: 'ma',
    groupNames: {},
  };
}

function migrateLocalStoreIfNeeded(campId: CampId) {
  if (campId !== 'tof') return;
  const key = storageKey(campId);
  if (localStorage.getItem(key)) return;
  const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (legacy) localStorage.setItem(key, legacy);
}

function migrateTrainerIfNeeded(campId: CampId) {
  if (campId !== 'tof') return;
  const key = trainerKey(campId);
  if (localStorage.getItem(key)) return;
  const legacy = localStorage.getItem(LEGACY_TRAINER_KEY);
  if (legacy) localStorage.setItem(key, legacy);
}

function readLocalStore(campId: CampId): CampStore {
  if (typeof window === 'undefined') return defaultStore(campId);
  migrateLocalStoreIfNeeded(campId);
  const raw = localStorage.getItem(storageKey(campId));
  if (!raw) {
    const store = defaultStore(campId);
    localStorage.setItem(storageKey(campId), JSON.stringify(store));
    return store;
  }
  const parsed = JSON.parse(raw) as CampStore;
  if (parsed.players.length === 0) parsed.players = createDefaultPlayersForCamp(campId);
  if (!parsed.groupNames) parsed.groupNames = {};
  return parsed;
}

function writeLocalStore(campId: CampId, store: CampStore) {
  localStorage.setItem(storageKey(campId), JSON.stringify(store));
}

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

type DbGroup = {
  id: number;
  name: string;
};

function mapGroupNames(rows: DbGroup[]): Record<number, string> {
  const names: Record<number, string> = {};
  for (const row of rows) {
    const trimmed = row.name.trim();
    if (trimmed) names[row.id] = trimmed;
  }
  return names;
}

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

async function fetchGroupNamesFromSupabase(
  supabase: ReturnType<typeof createClient>,
  campId: CampId
): Promise<Record<number, string>> {
  const { data, error } = await supabase
    .from('camp_groups')
    .select('id, name')
    .eq('camp_id', campId)
    .order('id');
  if (error) return {};
  return mapGroupNames((data ?? []) as DbGroup[]);
}

export async function getCampStore(campId: CampId): Promise<CampStore> {
  if (!shouldUseSupabase()) return readLocalStore(campId);

  try {
    const supabase = createClient();
    const [playersRes, challengesRes, feedRes, settingsRes] = await Promise.all([
      supabase.from('camp_players').select('*').eq('camp_id', campId).order('nickname'),
      supabase
        .from('camp_challenges')
        .select('*')
        .eq('camp_id', campId)
        .order('created_at', { ascending: false }),
      supabase
        .from('camp_feed')
        .select('*')
        .eq('camp_id', campId)
        .order('created_at', { ascending: false }),
      supabase.from('camp_settings').select('active_day').eq('camp_id', campId).maybeSingle(),
    ]);

    if (playersRes.error) {
      if (markSupabaseUnavailable(playersRes.error)) return readLocalStore(campId);
      throw playersRes.error;
    }

    campSupabaseReady = true;
    const groupNames = await fetchGroupNamesFromSupabase(supabase, campId);
    return {
      players: (playersRes.data as DbPlayer[]).map(mapPlayer),
      challenges: ((challengesRes.data ?? []) as DbChallenge[]).map(mapChallenge),
      feed: ((feedRes.data ?? []) as DbFeed[]).map(mapFeed),
      activeDay: (settingsRes.data?.active_day as CampDay) ?? 'ma',
      groupNames,
    };
  } catch (error) {
    if (markSupabaseUnavailable(error)) return readLocalStore(campId);
    throw error;
  }
}

export async function setActiveCampDay(campId: CampId, day: CampDay): Promise<void> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore(campId);
    store.activeDay = day;
    writeLocalStore(campId, store);
    return;
  }
  const { error } = await createClient()
    .from('camp_settings')
    .upsert({ camp_id: campId, active_day: day });
  if (error) {
    if (markSupabaseUnavailable(error)) {
      const store = readLocalStore(campId);
      store.activeDay = day;
      writeLocalStore(campId, store);
      return;
    }
    throw error;
  }
}

export async function setPlayerGroup(
  campId: CampId,
  playerId: string,
  groupId: number | null
): Promise<void> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore(campId);
    const player = store.players.find((p) => p.id === playerId);
    if (player) player.groupId = groupId;
    writeLocalStore(campId, store);
    return;
  }
  const { error } = await createClient()
    .from('camp_players')
    .update({ group_id: groupId })
    .eq('id', playerId)
    .eq('camp_id', campId);
  if (error) {
    if (markSupabaseUnavailable(error)) {
      const store = readLocalStore(campId);
      const player = store.players.find((p) => p.id === playerId);
      if (player) player.groupId = groupId;
      writeLocalStore(campId, store);
      return;
    }
    throw error;
  }
}

export async function getCampGroupNames(campId: CampId): Promise<Record<number, string>> {
  const store = await getCampStore(campId);
  return store.groupNames ?? {};
}

export async function setCampGroupName(
  campId: CampId,
  groupId: number,
  name: string
): Promise<void> {
  const trimmed = name.trim();

  if (!shouldUseSupabase()) {
    const store = readLocalStore(campId);
    if (!store.groupNames) store.groupNames = {};
    if (trimmed) store.groupNames[groupId] = trimmed;
    else delete store.groupNames[groupId];
    writeLocalStore(campId, store);
    return;
  }

  const { error } = await createClient()
    .from('camp_groups')
    .upsert({ camp_id: campId, id: groupId, name: trimmed });

  if (error) {
    if (markSupabaseUnavailable(error)) {
      const store = readLocalStore(campId);
      if (!store.groupNames) store.groupNames = {};
      if (trimmed) store.groupNames[groupId] = trimmed;
      else delete store.groupNames[groupId];
      writeLocalStore(campId, store);
      return;
    }
    throw error;
  }
}

export async function getCampPlayers(campId: CampId): Promise<CampPlayer[]> {
  const store = await getCampStore(campId);
  return store.players.sort((a, b) => a.nickname.localeCompare(b.nickname, 'nl'));
}

export async function createCampChallenge(
  campId: CampId,
  name: string,
  points: CampPointAmount
): Promise<CampChallenge> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore(campId);
    const challenge: CampChallenge = {
      id: generateId(),
      name: name.trim(),
      points,
      createdAt: new Date().toISOString(),
    };
    store.challenges.unshift(challenge);
    writeLocalStore(campId, store);
    return challenge;
  }
  const { data, error } = await createClient()
    .from('camp_challenges')
    .insert({ camp_id: campId, name: name.trim(), points })
    .select()
    .single();
  if (error) {
    if (markSupabaseUnavailable(error)) return createCampChallenge(campId, name, points);
    throw error;
  }
  return mapChallenge(data as DbChallenge);
}

export async function getCampChallenges(campId: CampId): Promise<CampChallenge[]> {
  const store = await getCampStore(campId);
  return store.challenges;
}

async function insertFeedEntry(
  campId: CampId,
  entry: Omit<CampFeedEntry, 'id' | 'createdAt'>
): Promise<CampFeedEntry> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore(campId);
    const full: CampFeedEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    store.feed.unshift(full);
    writeLocalStore(campId, store);
    return full;
  }
  const { data, error } = await createClient()
    .from('camp_feed')
    .insert({
      camp_id: campId,
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
    if (markSupabaseUnavailable(error)) return insertFeedEntry(campId, entry);
    throw error;
  }
  return mapFeed(data as DbFeed);
}

export async function awardPointsToPlayer(
  campId: CampId,
  input: {
    day: CampDay;
    trainer: CampTrainer;
    playerId: string;
    points: number;
    description: string;
    challengeId?: string;
    challengeName?: string;
  }
): Promise<CampFeedEntry> {
  return insertFeedEntry(campId, {
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

export async function awardPointsToGroup(
  campId: CampId,
  input: {
    day: CampDay;
    trainer: CampTrainer;
    groupId: number;
    points: number;
    description: string;
    challengeId?: string;
    challengeName?: string;
  }
): Promise<CampFeedEntry> {
  const players = await getCampPlayers(campId);
  const members = players.filter((p) => p.groupId === input.groupId);
  return insertFeedEntry(campId, {
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

export async function awardSpecialToPlayer(
  campId: CampId,
  input: {
    day: CampDay;
    trainer: CampTrainer;
    playerId: string;
    category: SpecialCategory;
    description?: string;
  }
): Promise<CampFeedEntry> {
  return insertFeedEntry(campId, {
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

export async function getCampFeed(campId: CampId, limit?: number): Promise<CampFeedEntry[]> {
  if (!shouldUseSupabase()) {
    const feed = readLocalStore(campId).feed;
    return limit ? feed.slice(0, limit) : feed;
  }
  try {
    let query = createClient()
      .from('camp_feed')
      .select('*')
      .eq('camp_id', campId)
      .order('created_at', { ascending: false });
    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      if (markSupabaseUnavailable(error)) {
        const feed = readLocalStore(campId).feed;
        return limit ? feed.slice(0, limit) : feed;
      }
      throw error;
    }
    return ((data ?? []) as DbFeed[]).map(mapFeed);
  } catch (error) {
    if (markSupabaseUnavailable(error)) {
      const feed = readLocalStore(campId).feed;
      return limit ? feed.slice(0, limit) : feed;
    }
    throw error;
  }
}

export async function deleteCampFeedEntry(campId: CampId, id: string): Promise<void> {
  if (!shouldUseSupabase()) {
    const store = readLocalStore(campId);
    store.feed = store.feed.filter((e) => e.id !== id);
    writeLocalStore(campId, store);
    return;
  }
  const { error } = await createClient()
    .from('camp_feed')
    .delete()
    .eq('id', id)
    .eq('camp_id', campId);
  if (error) {
    if (markSupabaseUnavailable(error)) {
      const store = readLocalStore(campId);
      store.feed = store.feed.filter((e) => e.id !== id);
      writeLocalStore(campId, store);
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

export async function computePlayerStats(
  campId: CampId,
  day?: CampDay
): Promise<PlayerDayStats[]> {
  const store = await getCampStore(campId);
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

export async function computeGroupStats(
  campId: CampId,
  day?: CampDay
): Promise<GroupDayStats[]> {
  const playerStats = await computePlayerStats(campId, day);
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

export async function getPlayerOfDay(
  campId: CampId,
  day?: CampDay
): Promise<PlayerDayStats | null> {
  const stats = (await computePlayerStats(campId, day))
    .filter((s) => s.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints);
  return stats[0] ?? null;
}

export async function getTopPlayers(
  campId: CampId,
  day?: CampDay,
  limit = 5
): Promise<PlayerDayStats[]> {
  return (await computePlayerStats(campId, day))
    .filter((s) => s.totalPoints > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit);
}

export async function getTopBySpecial(
  campId: CampId,
  category: SpecialCategory,
  day?: CampDay,
  limit = 5
): Promise<PlayerDayStats[]> {
  return (await computePlayerStats(campId, day))
    .filter((s) => s[category] > 0)
    .sort((a, b) => b[category] - a[category])
    .slice(0, limit);
}

export function getTrainerSession(campId: CampId): CampTrainer | null {
  if (typeof window === 'undefined') return null;
  migrateTrainerIfNeeded(campId);
  const v = localStorage.getItem(trainerKey(campId));
  return v as CampTrainer | null;
}

export function setTrainerSession(campId: CampId, trainer: CampTrainer) {
  localStorage.setItem(trainerKey(campId), trainer);
}

const nicknameCaches = new Map<CampId, Map<string, string>>();

export async function getPlayerNickname(campId: CampId, playerId: string): Promise<string> {
  const cached = nicknameCaches.get(campId);
  if (cached?.has(playerId)) return cached.get(playerId)!;
  const players = await getCampPlayers(campId);
  const map = new Map(players.map((p) => [p.id, p.nickname]));
  nicknameCaches.set(campId, map);
  return map.get(playerId) ?? '?';
}

export function subscribeCampFeed(campId: CampId, onChange: () => void): () => void {
  if (!shouldUseSupabase()) return () => undefined;

  try {
    const supabase = createClient();
    const channel = supabase
      .channel(`camp-feed-live-${campId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'camp_feed',
          filter: `camp_id=eq.${campId}`,
        },
        () => onChange()
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'camp_players',
          filter: `camp_id=eq.${campId}`,
        },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => undefined;
  }
}
