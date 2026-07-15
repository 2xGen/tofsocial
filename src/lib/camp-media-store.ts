import type { CampId } from '@/lib/camp-config';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const LEGACY_MEDIA_KEY = 'tof-social-camp-media';

function mediaKey(campId: CampId) {
  return `tof-social-camp-media:${campId}`;
}

export interface CampMediaItem {
  id: string;
  storagePath: string;
  publicUrl: string;
  caption: string;
  createdAt: string;
}

type DbMedia = {
  id: string;
  storage_path: string;
  public_url: string;
  caption: string;
  created_at: string;
};

function mapMedia(row: DbMedia): CampMediaItem {
  return {
    id: row.id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    caption: row.caption,
    createdAt: row.created_at,
  };
}

function migrateLocalMediaIfNeeded(campId: CampId) {
  if (campId !== 'tof') return;
  const key = mediaKey(campId);
  if (localStorage.getItem(key)) return;
  const legacy = localStorage.getItem(LEGACY_MEDIA_KEY);
  if (legacy) localStorage.setItem(key, legacy);
}

function readLocalMedia(campId: CampId): CampMediaItem[] {
  if (typeof window === 'undefined') return [];
  migrateLocalMediaIfNeeded(campId);
  const raw = localStorage.getItem(mediaKey(campId));
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CampMediaItem[];
  } catch {
    return [];
  }
}

function writeLocalMedia(campId: CampId, items: CampMediaItem[]) {
  localStorage.setItem(mediaKey(campId), JSON.stringify(items));
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function usesSupabaseMedia(): boolean {
  return typeof window !== 'undefined' && isSupabaseConfigured();
}

export function usesCampMedia(): boolean {
  return typeof window !== 'undefined';
}

export async function getCampMedia(campId: CampId, limit?: number): Promise<CampMediaItem[]> {
  if (!usesCampMedia()) return [];

  if (usesSupabaseMedia()) {
    let query = createClient()
      .from('camp_media')
      .select('*')
      .eq('camp_id', campId)
      .order('created_at', { ascending: false });
    if (limit !== undefined) query = query.limit(limit);
    const { data, error } = await query;

    if (!error) return ((data ?? []) as DbMedia[]).map(mapMedia);
  }

  const local = readLocalMedia(campId);
  return limit !== undefined ? local.slice(0, limit) : local;
}

async function uploadCampMediaLocal(
  campId: CampId,
  file: File,
  caption: string
): Promise<CampMediaItem> {
  const publicUrl = await fileToDataUrl(file);
  const item: CampMediaItem = {
    id: crypto.randomUUID(),
    storagePath: `local-${Date.now()}`,
    publicUrl,
    caption: caption.trim(),
    createdAt: new Date().toISOString(),
  };
  const items = readLocalMedia(campId);
  items.unshift(item);
  writeLocalMedia(campId, items);
  return item;
}

export async function uploadCampMedia(
  campId: CampId,
  file: File,
  caption = ''
): Promise<CampMediaItem> {
  if (!usesCampMedia()) {
    throw new Error('Upload niet beschikbaar.');
  }

  if (!usesSupabaseMedia()) {
    return uploadCampMediaLocal(campId, file, caption);
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const storagePath = `${campId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('camp-media')
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    return uploadCampMediaLocal(campId, file, caption);
  }

  const { data: urlData } = supabase.storage.from('camp-media').getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from('camp_media')
    .insert({
      camp_id: campId,
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      caption: caption.trim(),
    })
    .select()
    .single();

  if (error) {
    return uploadCampMediaLocal(campId, file, caption);
  }
  return mapMedia(data as DbMedia);
}

export async function deleteCampMedia(campId: CampId, item: CampMediaItem): Promise<void> {
  if (!usesCampMedia()) return;

  if (usesSupabaseMedia() && !item.storagePath.startsWith('local-')) {
    const supabase = createClient();
    await supabase.storage.from('camp-media').remove([item.storagePath]);
    const { error } = await supabase
      .from('camp_media')
      .delete()
      .eq('id', item.id)
      .eq('camp_id', campId);
    if (!error) return;
  }

  writeLocalMedia(
    campId,
    readLocalMedia(campId).filter((m) => m.id !== item.id)
  );
}

export function subscribeCampMedia(campId: CampId, onChange: () => void): () => void {
  if (usesSupabaseMedia()) {
    const supabase = createClient();
    const channel = supabase
      .channel(`camp-media-live-${campId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'camp_media',
          filter: `camp_id=eq.${campId}`,
        },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const key = mediaKey(campId);
  const onStorage = (e: StorageEvent) => {
    if (e.key === key) onChange();
  };
  window.addEventListener('storage', onStorage);
  const pollId = setInterval(onChange, 3000);
  return () => {
    window.removeEventListener('storage', onStorage);
    clearInterval(pollId);
  };
}
