'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  CAMP_MEDIA_MAX_BYTES,
  deleteCampMedia,
  detectMediaType,
  getCampMedia,
  subscribeCampMedia,
  uploadCampMedia,
  usesSupabaseMedia,
  type CampMediaItem,
  type CampMediaKind,
} from '@/lib/camp-media-store';
import { useCamp } from '@/lib/camp-context';

type SelectedMedia = {
  file: File;
  previewUrl: string;
  mediaType: CampMediaKind;
};

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
  const { campId, basePath } = useCamp();
  const [items, setItems] = useState<CampMediaItem[]>([]);
  const [caption, setCaption] = useState('');
  const [selected, setSelected] = useState<SelectedMedia[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = useCallback(async () => {
    setItems(await getCampMedia(campId, 48));
  }, [campId]);

  useEffect(() => {
    refresh();
    const unsub = subscribeCampMedia(campId, refresh);
    return () => unsub();
  }, [campId, refresh]);

  useEffect(() => {
    return () => {
      selected.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
  }, [selected]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;

    const next: SelectedMedia[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      const mediaType = detectMediaType(file);
      if (!mediaType) {
        rejected.push(`${file.name}: geen foto/video`);
        continue;
      }
      if (file.size > CAMP_MEDIA_MAX_BYTES) {
        rejected.push(`${file.name}: groter dan 100 MB`);
        continue;
      }
      if (mediaType === 'video' && !usesSupabaseMedia()) {
        rejected.push(`${file.name}: video vereist cloud-opslag`);
        continue;
      }
      next.push({
        file,
        previewUrl: URL.createObjectURL(file),
        mediaType,
      });
    }

    setError(rejected.length ? rejected.slice(0, 3).join(' · ') : '');
    setSuccess('');
    setSelected((prev) => {
      prev.forEach((s) => URL.revokeObjectURL(s.previewUrl));
      return next;
    });
  }

  async function handleUpload() {
    if (selected.length === 0) return;

    setError('');
    setSuccess('');
    setUploading(true);
    let ok = 0;
    const failures: string[] = [];

    try {
      for (let i = 0; i < selected.length; i++) {
        const item = selected[i];
        setUploadProgress(`${i + 1}/${selected.length}`);
        try {
          await uploadCampMedia(campId, item.file, caption);
          ok += 1;
        } catch (err) {
          failures.push(
            `${item.file.name}: ${err instanceof Error ? err.message : 'mislukt'}`
          );
        }
      }

      selected.forEach((s) => URL.revokeObjectURL(s.previewUrl));
      setSelected([]);
      setCaption('');
      await refresh();

      if (ok > 0) {
        setSuccess(
          ok === 1
            ? '1 bestand geüpload — zichtbaar op de kampwand.'
            : `${ok} bestanden geüpload — zichtbaar op de kampwand.`
        );
      }
      if (failures.length) {
        setError(failures.slice(0, 3).join(' · '));
      }
    } finally {
      setUploading(false);
      setUploadProgress('');
    }
  }

  function clearSelection() {
    selected.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    setSelected([]);
    setError('');
    setSuccess('');
  }

  function removeSelected(index: number) {
    setSelected((prev) => {
      const copy = [...prev];
      const [removed] = copy.splice(index, 1);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }

  async function handleDelete(item: CampMediaItem) {
    const label = item.mediaType === 'video' ? 'Video' : 'Foto';
    if (!window.confirm(`${label} verwijderen van de kampwand?`)) return;
    setDeletingId(item.id);
    setError('');
    try {
      await deleteCampMedia(campId, item);
      await refresh();
    } catch {
      setError('Verwijderen mislukt.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-tof-teal">Beheer</p>
          <h1 className="text-2xl font-bold text-tof-navy">Kampmedia</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload meerdere foto&apos;s of video&apos;s voor ouders op de kampwand.
          </p>
        </div>
        <Link href={basePath} className="text-sm font-semibold text-tof-teal hover:underline">
          Naar kampwand
        </Link>
      </div>

      {!usesSupabaseMedia() && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Cloud-sync is niet actief. Foto&apos;s blijven lokaal; video-upload werkt alleen met
          Supabase.
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded-xl bg-tof-teal/15 px-4 py-3 text-sm font-semibold text-tof-navy">
          {success}
        </p>
      )}

      <div className="tof-card tof-card-body space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-tof-navy">
            Onderschrift (optioneel, voor alle bestanden)
          </label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="bijv. Tiebreak finale"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-tof-navy">
            Foto&apos;s &amp; video&apos;s
          </label>
          <label className="btn-secondary inline-flex w-full cursor-pointer justify-center py-3">
            {selected.length > 0 ? 'Andere bestanden kiezen' : 'Bestanden kiezen'}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={handleFileSelect}
            />
          </label>
          <p className="mt-1.5 text-xs text-gray-400">
            Meerdere tegelijk · max. {formatBytes(CAMP_MEDIA_MAX_BYTES)} per bestand
          </p>
        </div>

        {selected.length > 0 ? (
          <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {selected.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="relative overflow-hidden rounded-lg border border-gray-200 bg-white"
                >
                  <div className="relative aspect-square bg-gray-100">
                    {item.mediaType === 'video' ? (
                      <video
                        src={item.previewUrl}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.previewUrl}
                        alt={item.file.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      {item.mediaType === 'video' ? 'Video' : 'Foto'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                    <p className="truncate text-[10px] text-gray-500">{item.file.name}</p>
                    <button
                      type="button"
                      onClick={() => removeSelected(index)}
                      disabled={uploading}
                      className="shrink-0 text-[10px] font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Weg
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary flex-1 py-3 disabled:opacity-50"
              >
                {uploading
                  ? `Uploaden… ${uploadProgress}`
                  : selected.length === 1
                    ? 'Uploaden'
                    : `${selected.length} uploaden`}
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={uploading}
                className="btn-secondary px-4 py-3 disabled:opacity-50"
              >
                Annuleren
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-6 tof-card tof-card-body">
        <h2 className="font-bold text-tof-navy">Geüploade media</h2>
        <p className="mt-1 text-xs text-gray-400">{items.length} totaal</p>

        {items.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Nog geen media geüpload.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <figure
                key={item.id}
                className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
              >
                <div className="relative aspect-square bg-gray-100">
                  {item.mediaType === 'video' ? (
                    <video
                      src={item.publicUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <Image
                      src={item.publicUrl}
                      alt={item.caption || 'Kampfoto'}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  )}
                  {item.mediaType === 'video' ? (
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                      Video
                    </span>
                  ) : null}
                </div>
                <figcaption className="space-y-2 p-2">
                  {item.caption ? (
                    <p className="truncate text-xs font-semibold text-tof-navy">{item.caption}</p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id}
                    className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === item.id ? 'Bezig…' : 'Verwijderen'}
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-gray-400">
        Galerij:{' '}
        <Link href={`${basePath}/kampfotos`} className="text-tof-teal hover:underline">
          {basePath}/kampfotos
        </Link>
        {' · '}
        Admin:{' '}
        <Link href={`${basePath}/admin`} className="text-tof-teal hover:underline">
          {basePath}/admin
        </Link>
      </p>
    </div>
  );
}
