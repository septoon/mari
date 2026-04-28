import { cache } from 'react';

import { getClientBootstrap } from '@/lib/api/backend';

export type PricesPageContent = {
  seo: {
    title: string;
    description: string;
  };
  heroActions: {
    primaryLabel: string;
  };
  catalog: {
    eyebrow: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  bottomCta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
};

export const PRICES_PAGE_DEFAULTS: PricesPageContent = {
  seo: {
    title: 'Цены',
    description: 'Цены на услуги МАРИ: процедуры, длительность и переход к записи.',
  },
  heroActions: {
    primaryLabel: 'Записаться',
  },
  catalog: {
    eyebrow: 'Прайс',
    title: 'Все услуги и цены.',
    description:
      'Разделы прайса собираются из опубликованных категорий услуг. Названия, описания, длительность и стоимость редактируются в разделе услуг.',
    emptyTitle: 'Прайс пока не опубликован.',
    emptyDescription: 'Добавьте услуги и категории в staff, чтобы они появились на странице цен.',
  },
  bottomCta: {
    eyebrow: 'После прайса',
    title: 'После прайса остается выбрать процедуру и удобное время.',
    description: 'Перейдите в карточку услуги или сразу откройте запись.',
    primaryCtaLabel: 'Каталог услуг',
    secondaryCtaLabel: 'Записаться',
  },
};

const asObjectRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const readString = (value: unknown, fallback: string) =>
  typeof value === 'string' ? value : fallback;

export const readPricesPageContent = (value: unknown): PricesPageContent => {
  const source = asObjectRecord(value);
  const seo = asObjectRecord(source.seo);
  const heroActions = asObjectRecord(source.heroActions);
  const catalog = asObjectRecord(source.catalog);
  const bottomCta = asObjectRecord(source.bottomCta);

  return {
    seo: {
      title: readString(seo.title, PRICES_PAGE_DEFAULTS.seo.title),
      description: readString(seo.description, PRICES_PAGE_DEFAULTS.seo.description),
    },
    heroActions: {
      primaryLabel: readString(heroActions.primaryLabel, PRICES_PAGE_DEFAULTS.heroActions.primaryLabel),
    },
    catalog: {
      eyebrow: readString(catalog.eyebrow, PRICES_PAGE_DEFAULTS.catalog.eyebrow),
      title: readString(catalog.title, PRICES_PAGE_DEFAULTS.catalog.title),
      description: readString(catalog.description, PRICES_PAGE_DEFAULTS.catalog.description),
      emptyTitle: readString(catalog.emptyTitle, PRICES_PAGE_DEFAULTS.catalog.emptyTitle),
      emptyDescription: readString(catalog.emptyDescription, PRICES_PAGE_DEFAULTS.catalog.emptyDescription),
    },
    bottomCta: {
      eyebrow: readString(bottomCta.eyebrow, PRICES_PAGE_DEFAULTS.bottomCta.eyebrow),
      title: readString(bottomCta.title, PRICES_PAGE_DEFAULTS.bottomCta.title),
      description: readString(bottomCta.description, PRICES_PAGE_DEFAULTS.bottomCta.description),
      primaryCtaLabel: readString(bottomCta.primaryCtaLabel, PRICES_PAGE_DEFAULTS.bottomCta.primaryCtaLabel),
      secondaryCtaLabel: readString(bottomCta.secondaryCtaLabel, PRICES_PAGE_DEFAULTS.bottomCta.secondaryCtaLabel),
    },
  };
};

export const getPricesPageContent = cache(async (): Promise<PricesPageContent> => {
  try {
    const bootstrap = await getClientBootstrap();
    const siteContent = asObjectRecord(asObjectRecord(bootstrap.config.extra).siteContent);
    return readPricesPageContent(siteContent.pricesPage);
  } catch {
    return PRICES_PAGE_DEFAULTS;
  }
});
