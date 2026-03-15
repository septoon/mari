import { cache } from 'react';
import { z } from 'zod';

import type { LocationProfile, NewsArticle, OfferItem } from '@/content/types';
import { locations as defaultLocations, news as defaultNews, offers as defaultOffers } from '@/content/site-data';
import { getClientBootstrap } from '@/lib/api/backend';

const offerItemSchema = z.object({
  slug: z.string(),
  title: z.string(),
  subtitle: z.string(),
  description: z.string(),
  badge: z.string(),
  priceNote: z.string(),
  ctaHref: z.string()
});

const newsArticleSchema = z.object({
  slug: z.string(),
  title: z.string(),
  category: z.string(),
  publishedAt: z.string(),
  excerpt: z.string(),
  body: z.array(z.string())
});

const locationProfileSchema = z.object({
  slug: z.string(),
  name: z.string(),
  district: z.string(),
  address: z.string(),
  phone: z.string(),
  workingHours: z.string(),
  mapUrl: z.string(),
  description: z.string(),
  note: z.string(),
  serviceSlugs: z.array(z.string()),
  masterSlugs: z.array(z.string()),
  features: z.array(z.string()),
  interiorMoments: z.array(
    z.object({
      title: z.string(),
      description: z.string()
    })
  )
});

const asObjectRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const readCollection = <T>(
  source: Record<string, unknown>,
  key: string,
  schema: z.ZodType<T[]>,
  fallback: T[]
) => {
  if (!Array.isArray(source[key])) {
    return fallback;
  }

  const parsed = schema.safeParse(source[key]);
  return parsed.success ? parsed.data : fallback;
};

export const getSiteCollections = cache(async (): Promise<{
  offers: OfferItem[];
  news: NewsArticle[];
  locations: LocationProfile[];
}> => {
  try {
    const bootstrap = await getClientBootstrap();
    const siteContent = asObjectRecord(asObjectRecord(bootstrap.config.extra).siteContent);

    return {
      offers: readCollection(siteContent, 'offers', z.array(offerItemSchema), defaultOffers),
      news: readCollection(siteContent, 'news', z.array(newsArticleSchema), defaultNews),
      locations: readCollection(siteContent, 'locations', z.array(locationProfileSchema), defaultLocations)
    };
  } catch {
    return {
      offers: defaultOffers,
      news: defaultNews,
      locations: defaultLocations
    };
  }
});

export const getSiteOffers = async () => (await getSiteCollections()).offers;

export const getSiteNews = async () => (await getSiteCollections()).news;

export const getSiteNewsArticle = async (slug: string) =>
  (await getSiteCollections()).news.find((item) => item.slug === slug) ?? null;

export const getSiteLocations = async () => (await getSiteCollections()).locations;

export const getSiteLocation = async (slug: string) =>
  (await getSiteCollections()).locations.find((item) => item.slug === slug) ?? null;
