import type { CampId } from '@/lib/camp-config';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

const LEGACY_MEDIA_KEY = 'tof-social-camp-media';

/** Max upload size (matches storage bucket limit). */
export const CAMP_MEDIA_MAX_BYTES = 100 * 1024 * 1024;

function mediaKey(campId: CampId) {
  return `tof-social-camp-media:${campId}`;
}

export type CampMediaKind = 'image' | 'video';

export interface CampMediaItem {
  id: string;
  storagePath: string;
  publicUrl: string;
  caption: string;
  createdAt: string;
  mediaType: CampMediaKind;
}

type DbMedia = {
  id: string;
  storage_path: string;
  public_url: string;
  caption: string;
  created_at: string;
  media_type?: string | null;
};

const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'm4v', 'ogg']);

export function inferMediaTypeFromPath(pathOrUrl: string): CampMediaKind {
  const clean = pathOrUrl.split('?')[0].toLowerCase();
  const ext = clean.includes('.') ? clean.split('.').pop()! : '';
  return VIDEO_EXT.has(ext) ? 'video' : 'image';
}

export function detectMediaType(file: File): CampMediaKind | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (/\.(jpe?g|png|gif|webp|heic)$/i.test(file.name)) return 'image';
  if (/\.(mp4|webm|mov|m4v|ogg)$/i.test(file.name)) return 'video';
  return null;
}

function mapMedia(row: DbMedia): CampMediaItem {
  const mediaType =
    row.media_type === 'video' || row.media_type === 'image'
      ? row.media_type
      : inferMediaTypeFromPath(row.storage_path || row.public_url);
  return {
    id: row.id,
    storagePath: row.storage_path,
    publicUrl: row.public_url,
    caption: row.caption,
    createdAt: row.created_at,
    mediaType,
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
    return (JSON.parse(raw) as CampMediaItem[]).map((item) => ({
      ...item,
      mediaType: item.mediaType ?? inferMediaTypeFromPath(item.storagePath || item.publicUrl),
    }));
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
  caption: string,
  mediaType: CampMediaKind
): Promise<CampMediaItem> {
  if (mediaType === 'video') {
    throw new Error('Video-upload vereist Supabase (te groot voor lokale opslag).');
  }
  const publicUrl = await fileToDataUrl(file);
  const item: CampMediaItem = {
    id: crypto.randomUUID(),
    storagePath: `local-${Date.now()}`,
    publicUrl,
    caption: caption.trim(),
    createdAt: new Date().toISOString(),
    mediaType,
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

  const mediaType = detectMediaType(file);
  if (!mediaType) {
    throw new Error('Alleen foto\'s en video\'s zijn toegestaan.');
  }
  if (file.size > CAMP_MEDIA_MAX_BYTES) {
    throw new Error('Bestand is te groot (max. 100 MB).');
  }

  if (!usesSupabaseMedia()) {
    return uploadCampMediaLocal(campId, file, caption, mediaType);
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || (mediaType === 'video' ? 'mp4' : 'jpg');
  const storagePath = `${campId}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('camp-media')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    if (mediaType === 'video') {
      throw new Error(uploadError.message || 'Video-upload mislukt.');
    }
    return uploadCampMediaLocal(campId, file, caption, mediaType);
  }

  const { data: urlData } = supabase.storage.from('camp-media').getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from('camp_media')
    .insert({
      camp_id: campId,
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      caption: caption.trim(),
      media_type: mediaType,
    })
    .select()
    .single();

  if (error) {
    // Older DB without media_type column — retry without it
    if (String(error.message || '').toLowerCase().includes('media_type')) {
      const retry = await supabase
        .from('camp_media')
        .insert({
          camp_id: campId,
          storage_path: storagePath,
          public_url: urlData.publicUrl,
          caption: caption.trim(),
        })
        .select()
        .single();
      if (!retry.error && retry.data) {
        return { ...mapMedia(retry.data as DbMedia), mediaType };
      }
    }
    if (mediaType === 'video') {
      throw new Error('Video opgeslagen in storage, maar database-insert mislukte. Run migratie 009.');
    }
    return uploadCampMediaLocal(campId, file, caption, mediaType);
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
