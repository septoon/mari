import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MARI Beauty Salon',
    short_name: 'MARI',
    description: 'Салон красоты MARI: услуги, специалисты, запись и личный кабинет.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f0eb',
    theme_color: '#0c4d55',
    lang: 'ru',
    icons: [
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
