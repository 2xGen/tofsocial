'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { getCampMedia, subscribeCampMedia } from '@/lib/camp-media-store';
import type { CampMediaItem } from '@/lib/camp-media-store';
import { useCamp } from '@/lib/camp-context';
import { cn } from '@/lib/utils';

interface CampMediaWallProps {
  limit?: number;
  layout?: 'grid' | 'feed';
}

function formatMediaTime(iso: string) {
  return new Date(iso).toLocaleString('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MediaThumb({
  item,
  className,
  sizes,
}: {
  item: CampMediaItem;
  className?: string;
  sizes?: string;
}) {
  if (item.mediaType === 'video') {
    return (
      <video
        src={item.publicUrl}
        className={cn('h-full w-full object-cover', className)}
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  return (
    <Image
      src={item.publicUrl}
      alt={item.caption || 'Kampfoto'}
      fill
      className={cn('object-cover', className)}
      sizes={sizes}
    />
  );
}

function PhotoLightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: CampMediaItem[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(index - 1);
      if (e.key === 'ArrowRight' && hasNext) onNavigate(index + 1);
    }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, onNavigate, index, hasPrev, hasNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Media vergroten"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
        aria-label="Sluiten"
      >
        <X className="h-6 w-6" />
      </button>

      {hasPrev ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index - 1);
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4"
          aria-label="Vorige"
        >
          <ChevronLeft className="h-7 w-7" />
        </button>
      ) : null}

      {hasNext ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(index + 1);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4"
          aria-label="Volgende"
        >
          <ChevronRight className="h-7 w-7" />
        </button>
      ) : null}

      <div
        className="flex max-h-full w-full max-w-3xl flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex max-h-[75vh] w-full items-center justify-center">
          {item.mediaType === 'video' ? (
            <video
              key={item.id}
              src={item.publicUrl}
              className="mx-auto max-h-[75vh] w-auto max-w-full rounded-lg"
              controls
              playsInline
              autoPlay
            />
          ) : (
            <Image
              src={item.publicUrl}
              alt={item.caption || 'Kampfoto'}
              width={1200}
              height={1200}
              className="mx-auto max-h-[75vh] w-auto max-w-full rounded-lg object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          )}
        </div>
        {(item.caption || item.createdAt) && (
          <div className="mt-4 max-w-lg text-center text-white">
            {item.caption ? <p className="text-base font-semibold">{item.caption}</p> : null}
            <p className="mt-1 text-sm text-white/60">{formatMediaTime(item.createdAt)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampMediaWall({ limit, layout = 'grid' }: CampMediaWallProps) {
  const { campId } = useCamp();
  const [items, setItems] = useState<CampMediaItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    setItems(await getCampMedia(campId, limit));
  }, [campId, limit]);

  useEffect(() => {
    refresh();
    const unsub = subscribeCampMedia(campId, refresh);
    return () => unsub();
  }, [campId, refresh]);

  if (items.length === 0) {
    return null;
  }

  if (layout === 'feed') {
    return (
      <>
        <div className="mx-auto flex w-full max-w-md flex-col gap-8">
          {items.map((item, i) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(i)}
                className="group relative block w-full cursor-zoom-in"
              >
                <div className="relative aspect-square bg-gray-100">
                  <MediaThumb
                    item={item}
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width: 448px) 100vw, 448px"
                  />
                  {item.mediaType === 'video' ? (
                    <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                      Video
                    </span>
                  ) : null}
                </div>
              </button>
              {(item.caption || item.createdAt) && (
                <div className="px-4 py-3">
                  {item.caption ? (
                    <p className="text-sm font-semibold leading-snug text-tof-navy">{item.caption}</p>
                  ) : null}
                  <p className={cn('text-xs text-gray-400', item.caption && 'mt-1')}>
                    {formatMediaTime(item.createdAt)}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>

        {lightboxIndex !== null ? (
          <PhotoLightbox
            items={items}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={setLightboxIndex}
          />
        ) : null}
      </>
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
            <MediaThumb
              item={item}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {item.mediaType === 'video' ? (
              <span className="absolute left-1.5 top-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                Video
              </span>
            ) : null}
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
