import type { MetadataRoute } from 'next';

const themeColor = '#245e63';
const backgroundColor = '#f4f0eb';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MARI Beauty Salon',
    short_name: 'MARI',
    description: 'Салон красоты MARI: услуги, специалисты, запись и личный кабинет.',
    start_url: '/',
    display: 'standalone',
    background_color: backgroundColor,
    theme_color: themeColor,
    lang: 'ru',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
        purpose: 'any'
      },
      {
        src: '/app-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/app-icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ]
  };
}
