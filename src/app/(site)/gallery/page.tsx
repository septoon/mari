import { notFound } from 'next/navigation';

import { GalleryCarousel } from '@/components/site/gallery-carousel';
import { getClientBootstrap } from '@/lib/api/backend';
import { getGalleryPageContent } from '@/lib/gallery-page-content';
import { createPageMetadata } from '@/lib/site';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export const metadata = createPageMetadata({
  title: 'Галерея',
  description: 'Галерея МАРИ: фотографии интерьера и экстерьера салона.',
  path: '/gallery',
});

export default async function GalleryPage() {
  const [bootstrap, gallery] = await Promise.all([
    getClientBootstrap(),
    getGalleryPageContent()
  ]);

  if (!isSiteBlockVisible(bootstrap.config.extra, SITE_BLOCK_KEYS.page('gallery'))) {
    notFound();
  }

  return (
    <main>
      <GalleryCarousel gallery={gallery} />
    </main>
  );
}
