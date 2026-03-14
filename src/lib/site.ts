import type { Metadata } from 'next';

export const siteConfig = {
  name: 'MARI Beauty Salon',
  shortName: 'MARI',
  description:
    'Салон красоты MARI: услуги, мастера, цены, подарочные сертификаты и личный кабинет.',
  phone: '+7 (978) 000-18-18',
  phoneHref: 'tel:+79780001818',
  email: 'hello@maribeauty.ru',
  address: 'Симферополь, ул. Екатерининская, 18',
  heroHeadline: 'Красота в спокойном ритме.',
  accentLabel: 'Салон красоты',
  nav: [
    { href: '/services', label: 'Услуги' },
    { href: '/masters', label: 'Мастера' },
    { href: '/prices', label: 'Цены' },
    { href: '/offers', label: 'Акции' },
    { href: '/gallery', label: 'Галерея' },
    { href: '/about', label: 'О салоне' },
    { href: '/contacts', label: 'Контакты' }
  ],
  footerNav: [
    {
      title: 'Навигация',
      items: [
        { href: '/services', label: 'Услуги' },
        { href: '/masters', label: 'Мастера' },
        { href: '/prices', label: 'Цены' }
      ]
    },
    {
      title: 'Для гостей',
      items: [
        { href: '/offers', label: 'Акции' },
        { href: '/gift-cards', label: 'Подарочные сертификаты' },
        { href: '/news', label: 'Новости' },
        { href: '/careers', label: 'Вакансии' }
      ]
    }
  ]
} as const;

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/+$/, '');

export const createPageMetadata = ({
  title,
  description,
  path = '',
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata => ({
  title,
  description,
  alternates: {
    canonical: path ? `${siteUrl}${path}` : siteUrl
  },
  openGraph: {
    title,
    description,
    url: path ? `${siteUrl}${path}` : siteUrl,
    siteName: siteConfig.name,
    locale: 'ru_RU',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description
  }
});
