import { cache } from 'react';
import { z } from 'zod';

import { getClientBootstrap } from '@/lib/api/backend';

export type GalleryCatalogKey = 'exterior' | 'interior';

export type GalleryPhoto = {
  id: string;
  imageUrl: string;
  alt: string;
};

export type GalleryPageContent = Record<GalleryCatalogKey, GalleryPhoto[]>;

const fallbackGallery: GalleryPageContent = {
  exterior: [
    {
      id: 'default-exterior',
      imageUrl: '/image.webp',
      alt: 'Экстерьер салона МАРИ'
    }
  ],
  interior: [
    {
      id: 'default-interior',
      imageUrl: '/image.webp',
      alt: 'Интерьер салона МАРИ'
    }
  ]
};

const galleryPhotoSchema = z.object({
  id: z.string(),
  imageUrl: z.string().optional(),
  alt: z.string().optional()
});

const gallerySchema = z.object({
  exterior: z.array(galleryPhotoSchema).optional(),
  interior: z.array(galleryPhotoSchema).optional()
});

const asObjectRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const readCatalog = (
  value: unknown,
  fallback: GalleryPhoto[],
  fallbackAlt: string
): GalleryPhoto[] => {
  const parsed = z.array(galleryPhotoSchema).safeParse(value);
  if (!parsed.success) {
    return fallback;
  }

  const photos = parsed.data
    .map((item, index) => ({
      id: item.id || `gallery-photo-${index + 1}`,
      imageUrl: item.imageUrl?.trim() || '',
      alt: item.alt?.trim() || fallbackAlt
    }))
    .filter((item) => item.imageUrl);

  return photos.length > 0 ? photos : fallback;
};

export const getGalleryPageContent = cache(async (): Promise<GalleryPageContent> => {
  try {
    const bootstrap = await getClientBootstrap();
    const siteContent = asObjectRecord(asObjectRecord(bootstrap.config.extra).siteContent);
    const parsed = gallerySchema.safeParse(siteContent.gallery);

    if (!parsed.success) {
      return fallbackGallery;
    }

    return {
      exterior: readCatalog(parsed.data.exterior, fallbackGallery.exterior, 'Экстерьер салона МАРИ'),
      interior: readCatalog(parsed.data.interior, fallbackGallery.interior, 'Интерьер салона МАРИ')
    };
  } catch {
    return fallbackGallery;
  }
});
