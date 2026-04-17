import type { MetadataRoute } from 'next';

const themeColor = '#245e63';
const backgroundColor = '#f4f0eb';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'МАРИ Салон Красоты',
    short_name: 'МАРИ',
    description: 'Салон красоты МАРИ: услуги, специалисты, запись и личный кабинет.',
    start_url: '/',
    display: 'standalone',
    background_color: backgroundColor,
    theme_color: themeColor,
    lang: 'ru',
    icons: [
      {
        src: '/app-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/app-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
