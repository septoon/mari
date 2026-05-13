'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { GalleryCatalogKey, GalleryPageContent } from '@/lib/gallery-page-content';

const catalogLabels: Record<GalleryCatalogKey, string> = {
  exterior: 'Экстерьер',
  interior: 'Интерьер'
};

export function GalleryCarousel({ gallery }: { gallery: GalleryPageContent }) {
  const [catalog, setCatalog] = useState<GalleryCatalogKey>('exterior');
  const [indexes, setIndexes] = useState<Record<GalleryCatalogKey, number>>({
    exterior: 0,
    interior: 0
  });

  const photos = gallery[catalog];
  const activeIndex = Math.min(indexes[catalog] ?? 0, Math.max(photos.length - 1, 0));
  const activePhoto = photos[activeIndex] ?? null;

  const controlsDisabled = photos.length <= 1;
  const counter = useMemo(() => {
    if (photos.length === 0) {
      return '0 / 0';
    }
    return `${activeIndex + 1} / ${photos.length}`;
  }, [activeIndex, photos.length]);

  const changeSlide = (direction: -1 | 1) => {
    if (photos.length <= 1) {
      return;
    }
    setIndexes((current) => ({
      ...current,
      [catalog]: (activeIndex + direction + photos.length) % photos.length
    }));
  };

  return (
    <section className="flex min-h-[calc(100dvh-var(--site-header-offset)-1.5rem)] flex-col">
      <div className="mx-auto flex w-full max-w-7xl shrink-0 gap-2 px-4 pt-4 sm:px-6 lg:px-8">
        {(Object.keys(catalogLabels) as GalleryCatalogKey[]).map((key) => (
          <Button
            key={key}
            type="button"
            variant={catalog === key ? 'primary' : 'secondary'}
            className="flex-1 sm:flex-none"
            onClick={() => setCatalog(key)}
            aria-pressed={catalog === key}
          >
            {catalogLabels[key]}
          </Button>
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 pb-4 pt-3 sm:px-6 lg:px-8">
        <div className="relative isolate min-h-[520px] w-full overflow-hidden rounded-[2rem] border border-(--line) bg-(--surface-strong) shadow-[0_24px_70px_rgba(45,31,19,0.08)]">
          {activePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${catalog}-${activePhoto.id}`}
              src={activePhoto.imageUrl}
              alt={activePhoto.alt}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[520px] items-center justify-center px-6 text-center text-(--muted)">
              В этом каталоге пока нет фотографий.
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/56 to-transparent p-4 text-white sm:p-6">
            <button
              type="button"
              onClick={() => changeSlide(-1)}
              disabled={controlsDisabled}
              aria-label="Предыдущее фото"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/32 bg-black/18 text-white backdrop-blur-md transition hover:bg-black/28 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="rounded-full border border-white/28 bg-black/18 px-4 py-2 text-sm font-semibold backdrop-blur-md">
              {counter}
            </div>

            <button
              type="button"
              onClick={() => changeSlide(1)}
              disabled={controlsDisabled}
              aria-label="Следующее фото"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/32 bg-black/18 text-white backdrop-blur-md transition hover:bg-black/28 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
