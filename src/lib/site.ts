import type { Metadata } from 'next';

import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export const siteConfig = {
  name: 'МАРИ Салон Красоты',
  shortName: 'МАРИ',
  description:
    'Салон красоты МАРИ в Симферополе: маникюр, педикюр, стрижки, окрашивание, косметолог, лазерная эпиляция и онлайн-запись.',
  phone: '+7 (978) 000-18-18',
  phoneHref: 'tel:+79786778130',
  email: 'hello@maribeauty.ru',
  address: 'Симферополь, ул. Екатерининская, 18',
  heroHeadline: 'Красота в спокойном ритме.',
  accentLabel: 'Салон красоты',
  nav: [
    { href: '/services', label: 'Услуги' },
    { href: '/masters', label: 'Специалисты' },
    { href: '/prices', label: 'Цены' },
    { href: '/booking', label: 'Запись' },
    { href: '/offers', label: 'Акции' },
    { href: '/gallery', label: 'Галерея' },
    { href: '/about', label: 'О салоне' },
    { href: '/contacts', label: 'Контакты' },
  ],
  footerNav: [
    {
      title: 'Навигация',
      items: [
        { href: '/services', label: 'Услуги' },
        { href: '/masters', label: 'Специалисты' },
        { href: '/prices', label: 'Цены' },
        { href: '/booking', label: 'Запись' },
      ],
    },
    {
      title: 'Для гостей',
      items: [
        { href: '/offers', label: 'Акции' },
        { href: '/gift-cards', label: 'Подарочные сертификаты' },
        { href: '/news', label: 'Новости' },
        { href: '/careers', label: 'Вакансии' },
      ],
    },
  ],
  footerUtilityNav: [
    { href: '/news', label: 'Новости' },
    { href: '/careers', label: 'Вакансии' },
    { href: '/gift-cards', label: 'Сертификаты' },
    { href: '/privacy-policy', label: 'Политика конфиденциальности' },
  ],
} as const;

export type SiteNavItem = {
  readonly href: string;
  readonly label: string;
};

export type SiteFooterNavGroup = {
  readonly title: string;
  readonly items: readonly SiteNavItem[];
};

const SITE_NAV_PAGE_KEYS: Partial<Record<string, string>> = {
  '/services': 'services',
  '/masters': 'masters',
  '/prices': 'prices',
  '/booking': 'booking',
  '/offers': 'offers',
  '/gallery': 'gallery',
  '/about': 'about',
  '/contacts': 'contacts',
  '/gift-cards': 'giftCards',
  '/news': 'news',
  '/careers': 'careers',
  '/privacy-policy': 'privacyPolicy',
};

export const isSiteNavigationItemVisible = (
  extra: Record<string, unknown> | null | undefined,
  href: string,
) => {
  const pageKey = SITE_NAV_PAGE_KEYS[href];
  return pageKey ? isSiteBlockVisible(extra, SITE_BLOCK_KEYS.page(pageKey)) : true;
};

export const getVisibleSiteNav = (
  extra: Record<string, unknown> | null | undefined,
): SiteNavItem[] => siteConfig.nav.filter((item) => isSiteNavigationItemVisible(extra, item.href));

export const getVisibleSiteLinks = <T extends SiteNavItem>(
  extra: Record<string, unknown> | null | undefined,
  items: readonly T[],
): T[] => items.filter((item) => isSiteNavigationItemVisible(extra, item.href));

export const getVisibleSiteFooterNav = (
  extra: Record<string, unknown> | null | undefined,
): SiteFooterNavGroup[] =>
  siteConfig.footerNav.map((group) => ({
    ...group,
    items: group.items.filter((item) => isSiteNavigationItemVisible(extra, item.href)),
  }));

export const getVisibleSiteFooterUtilityNav = (
  extra: Record<string, unknown> | null | undefined,
): SiteNavItem[] => getVisibleSiteLinks(extra, siteConfig.footerUtilityNav);

export const siteSeoConfig = {
  city: 'Симферополь',
  region: 'Республика Крым',
  countryCode: 'RU',
  streetAddress: 'ул. Екатерининская, 18',
  priceRange: '₽₽',
  geo: {
    latitude: 44.9521,
    longitude: 34.1024,
  },
  openingHours: ['Mo-Su 09:00-21:00'],
  sameAs: [
    'https://wa.me/+79786778130',
    'https://t.me/maribeauty2025',
    'https://www.instagram.com/mari_beauty_simf',
    'https://vk.com/mari_beauty_simf',
  ],
  home: {
    title: 'Салон красоты в Симферополе',
    description:
      'Салон красоты МАРИ в Симферополе: маникюр, педикюр, стрижки, окрашивание, косметолог, ресницы, лазерная эпиляция и онлайн-запись.',
    keywords: [
      'салон красоты Симферополь',
      'студия красоты Симферополь',
      'парикмахерская Симферополь',
      'салон маникюра Симферополь',
      'косметолог Симферополь',
      'маникюр Симферополь',
      'педикюр Симферополь',
      'окрашивание волос Симферополь',
      'стрижка Симферополь',
      'наращивание ресниц Симферополь',
      'татуаж бровей Симферополь',
      'чистка лица Симферополь',
      'лазерная эпиляция Симферополь',
      'визажист Симферополь',
      'записаться в салон красоты',
    ],
  },
} as const;

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maribeauty.ru').replace(
  /\/+$/,
  '',
);
export const siteImageUrl = `${siteUrl}/image.webp`;
export const defaultMetaImage = {
  url: siteImageUrl,
  width: 1536,
  height: 1024,
  alt: 'МАРИ Салон Красоты',
} as const;

export const createPageMetadata = ({
  title,
  description,
  path = '',
  keywords,
  robots,
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  robots?: Metadata['robots'];
}): Metadata => {
  const pageUrl = path && path !== '/' ? `${siteUrl}${path}` : siteUrl;

  return {
    title,
    description,
    keywords,
    robots: robots ?? {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: 'ru_RU',
      type: 'website',
      images: [defaultMetaImage],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [siteImageUrl],
    },
  };
};
