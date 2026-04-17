import type { SitePageHeroKey } from '@/lib/site-page-heroes';

const SITE_VISIBILITY_KEY = 'siteVisibility';
const HIDDEN_BLOCK_KEYS_KEY = 'hiddenBlockKeys';

export const SITE_BLOCK_KEYS = {
  pageHero: (key: SitePageHeroKey) => `pageHero:${key}`,
  homePage: {
    hero: 'homePage:hero',
    categories: 'homePage:categories',
    valuePillars: 'homePage:valuePillars',
    featuredServices: 'homePage:featuredServices',
    featuredSpecialists: 'homePage:featuredSpecialists',
    contacts: 'homePage:contacts',
    highlights: 'homePage:highlights',
    bottomCta: 'homePage:bottomCta',
  },
  specialistsPage: {
    listHero: 'specialistsPage:listHero',
    listCta: 'specialistsPage:listCta',
    detailHero: 'specialistsPage:detailHero',
    detailAbout: 'specialistsPage:detailAbout',
    detailApproach: 'specialistsPage:detailApproach',
    detailServices: 'specialistsPage:detailServices',
    detailCta: 'specialistsPage:detailCta',
  },
  bookingPage: {
    connectivityNotice: 'bookingPage:connectivityNotice',
  },
  offers: {
    item: (slug: string) => `offers:item:${slug}`,
  },
  news: {
    item: (slug: string) => `news:item:${slug}`,
  },
  locations: {
    item: (slug: string) => `locations:item:${slug}`,
  },
  policy: {
    summary: 'policy:summary',
    section: (id: string) => `policy:section:${id}`,
  },
} as const;

const asObjectRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

export const readSiteHiddenBlockKeys = (extra: Record<string, unknown> | null | undefined) => {
  const siteVisibility = asObjectRecord(asObjectRecord(extra)[SITE_VISIBILITY_KEY]);
  const hiddenBlockKeys = siteVisibility[HIDDEN_BLOCK_KEYS_KEY];

  if (!Array.isArray(hiddenBlockKeys)) {
    return new Set<string>();
  }

  return new Set(
    hiddenBlockKeys.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean),
  );
};

export const isSiteBlockVisible = (
  extra: Record<string, unknown> | null | undefined,
  blockKey: string,
) => !readSiteHiddenBlockKeys(extra).has(blockKey);
