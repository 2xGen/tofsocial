'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  deleteCampMedia,
  getCampMedia,
  subscribeCampMedia,
  uploadCampMedia,
  usesSupabaseMedia,
  type CampMediaItem,
} from '@/lib/camp-media-store';

export default function MediaPage() {
  const [items, setItems] = useState<CampMediaItem[]>([]);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const refresh = useCallback(async () => {
    setItems(await getCampMedia(48));
  }, []);

  useEffect(() => {
    refresh();
    const unsub = subscribeCampMedia(refresh);
    return () => unsub();
  }, [refresh]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Alleen afbeeldingen zijn toegestaan.');
      setSelectedFile(null);
      return;
    }

    setError('');
    setSuccess('');
    setSelectedFile(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setError('');
    setSuccess('');
    setUploading(true);
    try {
      await uploadCampMedia(selectedFile, caption);
      setCaption('');
      setSelectedFile(null);
      setSuccess('Foto geüpload — zichtbaar op de kampwand.');
      await refresh();
    } catch {
      setError('Upload mislukt. Controleer of de media-tabel en storage bucket bestaan in Supabase.');
    } finally {
      setUploading(false);
    }
  }

  function clearSelection() {
    setSelectedFile(null);
    setError('');
    setSuccess('');
  }

  async function handleDelete(item: CampMediaItem) {
    if (!window.confirm('Foto verwijderen van de kampwand?')) return;
    setDeletingId(item.id);
    setError('');
    try {
      await deleteCampMedia(item);
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
          <h1 className="text-2xl font-bold text-tof-navy">Kampfoto&apos;s</h1>
          <p className="mt-1 text-sm text-gray-600">
            Upload foto&apos;s voor ouders op de kampwand.
          </p>
        </div>
        <Link href="/tof-kamp" className="text-sm font-semibold text-tof-teal hover:underline">
          Naar kampwand
        </Link>
      </div>

      {!usesSupabaseMedia() && (
        <p className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Lokaal testen: foto&apos;s worden in deze browser opgeslagen. Voor sync tussen
          telefoons en de live site, zet{' '}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_URL</code> en{' '}
          <code className="text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{' '}
          <code className="text-xs">.env.local</code> en herstart de dev server.
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
            Onderschrift (optioneel)
          </label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="bijv. Tiebreak finale"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-tof-teal"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-tof-navy">Foto</label>
          <label className="btn-secondary inline-flex w-full cursor-pointer justify-center py-3">
            {selectedFile ? 'Andere foto kiezen' : 'Foto kiezen'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={uploading}
              onChange={handleFileSelect}
            />
          </label>
        </div>

        {previewUrl && selectedFile ? (
          <div className="space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-gray-200">
              <Image
                src={previewUrl}
                alt="Geselecteerde foto"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="truncate text-xs text-gray-500">{selectedFile.name}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary flex-1 py-3 disabled:opacity-50"
              >
                {uploading ? 'Uploaden…' : 'Uploaden'}
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
        <h2 className="font-bold text-tof-navy">Geüploade foto&apos;s</h2>
        <p className="mt-1 text-xs text-gray-400">{items.length} totaal</p>

        {items.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">Nog geen foto&apos;s geüpload.</p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {items.map((item) => (
              <figure
                key={item.id}
                className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
              >
                <div className="relative aspect-square">
                  <Image
                    src={item.publicUrl}
                    alt={item.caption || 'Kampfoto'}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
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
        Galerij: <Link href="/kampfotos" className="text-tof-teal hover:underline">/kampfotos</Link>
        {' · '}
        Admin: <Link href="/admin" className="text-tof-teal hover:underline">/admin</Link>
      </p>
    </div>
  );
}
