import { cache } from 'react';

import { getClientBootstrap } from '@/lib/api/backend';

export type ServicesPageContent = {
  seo: {
    title: string;
    description: string;
  };
  heroActions: {
    primaryLabel: string;
    secondaryLabel: string;
  };
  catalog: {
    eyebrow: string;
    title: string;
    description: string;
    sectionCardEyebrow: string;
    sectionCardFallbackText: string;
    sectionCardServiceCountTemplate: string;
    sectionCardActionLabel: string;
    categoryFallbackText: string;
    categoryServiceCountTemplate: string;
    categoryActionLabel: string;
  };
  bottomCta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
};

export const SERVICES_PAGE_DEFAULTS: ServicesPageContent = {
  seo: {
    title: 'Услуги',
    description: 'Каталог услуг МАРИ: процедуры, цены, длительность и переход к записи.',
  },
  heroActions: {
    primaryLabel: 'Записаться',
    secondaryLabel: 'Смотреть цены',
  },
  catalog: {
    eyebrow: 'Каталог услуг',
    title: 'Сначала выберите раздел.',
    description:
      'На первом экране показываем только разделы и категории, которые не входят ни в один раздел.',
    sectionCardEyebrow: 'Раздел услуг',
    sectionCardFallbackText: 'Место под фото раздела',
    sectionCardServiceCountTemplate: '{count} услуг',
    sectionCardActionLabel: 'Открыть',
    categoryFallbackText: 'Место под фото категории',
    categoryServiceCountTemplate: '{count} услуг',
    categoryActionLabel: 'Подробнее',
  },
  bottomCta: {
    eyebrow: 'Запись',
    title: 'Осталось выбрать услугу и удобное время.',
    description: 'Можно перейти в карточку процедуры, сравнить варианты или сразу открыть запись.',
    primaryCtaLabel: 'Записаться',
    secondaryCtaLabel: 'Выбрать мастера',
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

export const readServicesPageContent = (value: unknown): ServicesPageContent => {
  const source = asObjectRecord(value);
  const seo = asObjectRecord(source.seo);
  const heroActions = asObjectRecord(source.heroActions);
  const catalog = asObjectRecord(source.catalog);
  const bottomCta = asObjectRecord(source.bottomCta);

  return {
    seo: {
      title: readString(seo.title, SERVICES_PAGE_DEFAULTS.seo.title),
      description: readString(seo.description, SERVICES_PAGE_DEFAULTS.seo.description),
    },
    heroActions: {
      primaryLabel: readString(heroActions.primaryLabel, SERVICES_PAGE_DEFAULTS.heroActions.primaryLabel),
      secondaryLabel: readString(heroActions.secondaryLabel, SERVICES_PAGE_DEFAULTS.heroActions.secondaryLabel),
    },
    catalog: {
      eyebrow: readString(catalog.eyebrow, SERVICES_PAGE_DEFAULTS.catalog.eyebrow),
      title: readString(catalog.title, SERVICES_PAGE_DEFAULTS.catalog.title),
      description: readString(catalog.description, SERVICES_PAGE_DEFAULTS.catalog.description),
      sectionCardEyebrow: readString(catalog.sectionCardEyebrow, SERVICES_PAGE_DEFAULTS.catalog.sectionCardEyebrow),
      sectionCardFallbackText: readString(catalog.sectionCardFallbackText, SERVICES_PAGE_DEFAULTS.catalog.sectionCardFallbackText),
      sectionCardServiceCountTemplate: readString(
        catalog.sectionCardServiceCountTemplate,
        SERVICES_PAGE_DEFAULTS.catalog.sectionCardServiceCountTemplate,
      ),
      sectionCardActionLabel: readString(catalog.sectionCardActionLabel, SERVICES_PAGE_DEFAULTS.catalog.sectionCardActionLabel),
      categoryFallbackText: readString(catalog.categoryFallbackText, SERVICES_PAGE_DEFAULTS.catalog.categoryFallbackText),
      categoryServiceCountTemplate: readString(
        catalog.categoryServiceCountTemplate,
        SERVICES_PAGE_DEFAULTS.catalog.categoryServiceCountTemplate,
      ),
      categoryActionLabel: readString(catalog.categoryActionLabel, SERVICES_PAGE_DEFAULTS.catalog.categoryActionLabel),
    },
    bottomCta: {
      eyebrow: readString(bottomCta.eyebrow, SERVICES_PAGE_DEFAULTS.bottomCta.eyebrow),
      title: readString(bottomCta.title, SERVICES_PAGE_DEFAULTS.bottomCta.title),
      description: readString(bottomCta.description, SERVICES_PAGE_DEFAULTS.bottomCta.description),
      primaryCtaLabel: readString(bottomCta.primaryCtaLabel, SERVICES_PAGE_DEFAULTS.bottomCta.primaryCtaLabel),
      secondaryCtaLabel: readString(bottomCta.secondaryCtaLabel, SERVICES_PAGE_DEFAULTS.bottomCta.secondaryCtaLabel),
    },
  };
};

export const getServicesPageContent = cache(async (): Promise<ServicesPageContent> => {
  try {
    const bootstrap = await getClientBootstrap();
    const siteContent = asObjectRecord(asObjectRecord(bootstrap.config.extra).siteContent);
    return readServicesPageContent(siteContent.servicesPage);
  } catch {
    return SERVICES_PAGE_DEFAULTS;
  }
});

export const applyServicesPageTemplate = (template: string, values: { count: number }) =>
  template.replace(/\{count\}/g, String(values.count));
