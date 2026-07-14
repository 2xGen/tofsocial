import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const MEDIA_STORAGE_KEY = 'tof-social-camp-media';

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

function readLocalMedia(): CampMediaItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(MEDIA_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as CampMediaItem[];
  } catch {
    return [];
  }
}

function writeLocalMedia(items: CampMediaItem[]) {
  localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
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

/** Media uploads work locally (localStorage) or via Supabase. */
export function usesCampMedia(): boolean {
  return typeof window !== 'undefined';
}

export async function getCampMedia(limit?: number): Promise<CampMediaItem[]> {
  if (!usesCampMedia()) return [];

  if (usesSupabaseMedia()) {
    let query = createClient()
      .from('camp_media')
      .select('*')
      .order('created_at', { ascending: false });
    if (limit !== undefined) query = query.limit(limit);
    const { data, error } = await query;

    if (!error) return ((data ?? []) as DbMedia[]).map(mapMedia);
  }

  const local = readLocalMedia();
  return limit !== undefined ? local.slice(0, limit) : local;
}

async function uploadCampMediaLocal(file: File, caption: string): Promise<CampMediaItem> {
  const publicUrl = await fileToDataUrl(file);
  const item: CampMediaItem = {
    id: crypto.randomUUID(),
    storagePath: `local-${Date.now()}`,
    publicUrl,
    caption: caption.trim(),
    createdAt: new Date().toISOString(),
  };
  const items = readLocalMedia();
  items.unshift(item);
  writeLocalMedia(items);
  return item;
}

export async function uploadCampMedia(file: File, caption = ''): Promise<CampMediaItem> {
  if (!usesCampMedia()) {
    throw new Error('Upload niet beschikbaar.');
  }

  if (!usesSupabaseMedia()) {
    return uploadCampMediaLocal(file, caption);
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const storagePath = `${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('camp-media')
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) {
    return uploadCampMediaLocal(file, caption);
  }

  const { data: urlData } = supabase.storage.from('camp-media').getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from('camp_media')
    .insert({
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      caption: caption.trim(),
    })
    .select()
    .single();

  if (error) {
    return uploadCampMediaLocal(file, caption);
  }
  return mapMedia(data as DbMedia);
}

export async function deleteCampMedia(item: CampMediaItem): Promise<void> {
  if (!usesCampMedia()) return;

  if (usesSupabaseMedia() && !item.storagePath.startsWith('local-')) {
    const supabase = createClient();
    await supabase.storage.from('camp-media').remove([item.storagePath]);
    const { error } = await supabase.from('camp_media').delete().eq('id', item.id);
    if (!error) return;
  }

  writeLocalMedia(readLocalMedia().filter((m) => m.id !== item.id));
}

export function subscribeCampMedia(onChange: () => void): () => void {
  if (usesSupabaseMedia()) {
    const supabase = createClient();
    const channel = supabase
      .channel('camp-media-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'camp_media' }, () =>
        onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const onStorage = (e: StorageEvent) => {
    if (e.key === MEDIA_STORAGE_KEY) onChange();
  };
  window.addEventListener('storage', onStorage);
  const pollId = setInterval(onChange, 3000);
  return () => {
    window.removeEventListener('storage', onStorage);
    clearInterval(pollId);
  };
}
