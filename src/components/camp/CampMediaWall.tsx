'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { getCampMedia, subscribeCampMedia } from '@/lib/camp-media-store';
import type { CampMediaItem } from '@/lib/camp-media-store';

interface CampMediaWallProps {
  limit?: number;
  uploadHref?: string;
}

function formatMediaTime(iso: string) {
  return new Date(iso).toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CampMediaWall({ limit, uploadHref = '/media' }: CampMediaWallProps) {
  const [items, setItems] = useState<CampMediaItem[]>([]);

  const refresh = useCallback(async () => {
    setItems(await getCampMedia(limit));
  }, [limit]);

  useEffect(() => {
    refresh();
    const unsub = subscribeCampMedia(refresh);
    return () => unsub();
  }, [refresh]);

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-400">
        Nog geen foto&apos;s. Begeleiders kunnen ze uploaden via{' '}
        <a href={uploadHref} className="font-semibold text-tof-teal hover:underline">
          {uploadHref}
        </a>
        .
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </div>
          {(item.caption || item.createdAt) && (
            <figcaption className="px-2 py-1.5">
              {item.caption ? (
                <p className="truncate text-xs font-semibold text-tof-navy">{item.caption}</p>
              ) : null}
              <p className="text-[10px] text-gray-400">{formatMediaTime(item.createdAt)}</p>
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}
