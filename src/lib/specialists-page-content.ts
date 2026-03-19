import { cache } from 'react';

import { getClientBootstrap } from '@/lib/api/backend';

export type SpecialistsPageContent = {
  listPage: {
    heroPrimaryCtaLabel: string;
    detailsCountTemplate: string;
    detailsFilterText: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
  };
  detailPage: {
    heroPrimaryCtaLabel: string;
    heroSecondaryCtaLabel: string;
    detailsServicesTemplate: string;
    detailsCategoriesTemplate: string;
    aboutEyebrow: string;
    aboutSpecialtyLabel: string;
    aboutCategoriesLabel: string;
    aboutUpdatedLabel: string;
    approachEyebrow: string;
    approachTitle: string;
    approachDescription: string;
    servicesEyebrow: string;
    servicesTitle: string;
    servicesDescription: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaDescription: string;
    ctaPrimaryLabel: string;
    ctaSecondaryLabel: string;
  };
};

export const SPECIALISTS_PAGE_DEFAULTS: SpecialistsPageContent = {
  listPage: {
    heroPrimaryCtaLabel: 'Записаться',
    detailsCountTemplate: '{count} специалистов в каталоге.',
    detailsFilterText: 'Фильтр по специализации помогает быстро сузить выбор.',
    ctaEyebrow: 'Выбор специалиста',
    ctaTitle: 'Выберите специалиста и перейдите к записи.',
    ctaDescription:
      'На странице специалиста собраны направления работы, услуги и удобный переход к ближайшему визиту.',
    ctaPrimaryLabel: 'Записаться',
    ctaSecondaryLabel: 'Смотреть услуги'
  },
  detailPage: {
    heroPrimaryCtaLabel: 'Записаться к специалисту',
    heroSecondaryCtaLabel: 'Все специалисты',
    detailsServicesTemplate: '{count} услуг доступно для онлайн-записи.',
    detailsCategoriesTemplate: 'Направления: {categories}.',
    aboutEyebrow: 'О специалисте',
    aboutSpecialtyLabel: 'Специализация',
    aboutCategoriesLabel: 'Категории услуг',
    aboutUpdatedLabel: 'Последнее обновление',
    approachEyebrow: 'Подход',
    approachTitle: 'Выбирайте специалиста по направлению и стилю работы.',
    approachDescription:
      'На странице собраны ключевые направления специалиста и список услуг, чтобы вы могли быстро понять, подходит ли вам этот специалист.',
    servicesEyebrow: 'Услуги специалиста',
    servicesTitle: 'Услуги, на которые можно записаться к этому специалисту.',
    servicesDescription:
      'Сравните процедуры по времени и стоимости и выберите ту, которая подходит именно вам.',
    ctaEyebrow: 'Запись к специалисту',
    ctaTitle: 'Если специалист подходит вам по направлению, переходите к записи.',
    ctaDescription: 'Осталось выбрать услугу и удобное время визита.',
    ctaPrimaryLabel: 'Записаться к специалисту',
    ctaSecondaryLabel: 'Контакты салона'
  }
};

const asObjectRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const readString = (value: unknown, fallback: string) =>
  typeof value === 'string' ? value : fallback;

export const readSpecialistsPageContent = (value: unknown): SpecialistsPageContent => {
  const source = asObjectRecord(value);
  const listPage = asObjectRecord(source.listPage);
  const detailPage = asObjectRecord(source.detailPage);

  return {
    listPage: {
      heroPrimaryCtaLabel: readString(
        listPage.heroPrimaryCtaLabel,
        SPECIALISTS_PAGE_DEFAULTS.listPage.heroPrimaryCtaLabel
      ),
      detailsCountTemplate: readString(
        listPage.detailsCountTemplate,
        SPECIALISTS_PAGE_DEFAULTS.listPage.detailsCountTemplate
      ),
      detailsFilterText: readString(
        listPage.detailsFilterText,
        SPECIALISTS_PAGE_DEFAULTS.listPage.detailsFilterText
      ),
      ctaEyebrow: readString(listPage.ctaEyebrow, SPECIALISTS_PAGE_DEFAULTS.listPage.ctaEyebrow),
      ctaTitle: readString(listPage.ctaTitle, SPECIALISTS_PAGE_DEFAULTS.listPage.ctaTitle),
      ctaDescription: readString(
        listPage.ctaDescription,
        SPECIALISTS_PAGE_DEFAULTS.listPage.ctaDescription
      ),
      ctaPrimaryLabel: readString(
        listPage.ctaPrimaryLabel,
        SPECIALISTS_PAGE_DEFAULTS.listPage.ctaPrimaryLabel
      ),
      ctaSecondaryLabel: readString(
        listPage.ctaSecondaryLabel,
        SPECIALISTS_PAGE_DEFAULTS.listPage.ctaSecondaryLabel
      )
    },
    detailPage: {
      heroPrimaryCtaLabel: readString(
        detailPage.heroPrimaryCtaLabel,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.heroPrimaryCtaLabel
      ),
      heroSecondaryCtaLabel: readString(
        detailPage.heroSecondaryCtaLabel,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.heroSecondaryCtaLabel
      ),
      detailsServicesTemplate: readString(
        detailPage.detailsServicesTemplate,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.detailsServicesTemplate
      ),
      detailsCategoriesTemplate: readString(
        detailPage.detailsCategoriesTemplate,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.detailsCategoriesTemplate
      ),
      aboutEyebrow: readString(
        detailPage.aboutEyebrow,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.aboutEyebrow
      ),
      aboutSpecialtyLabel: readString(
        detailPage.aboutSpecialtyLabel,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.aboutSpecialtyLabel
      ),
      aboutCategoriesLabel: readString(
        detailPage.aboutCategoriesLabel,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.aboutCategoriesLabel
      ),
      aboutUpdatedLabel: readString(
        detailPage.aboutUpdatedLabel,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.aboutUpdatedLabel
      ),
      approachEyebrow: readString(
        detailPage.approachEyebrow,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.approachEyebrow
      ),
      approachTitle: readString(
        detailPage.approachTitle,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.approachTitle
      ),
      approachDescription: readString(
        detailPage.approachDescription,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.approachDescription
      ),
      servicesEyebrow: readString(
        detailPage.servicesEyebrow,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.servicesEyebrow
      ),
      servicesTitle: readString(
        detailPage.servicesTitle,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.servicesTitle
      ),
      servicesDescription: readString(
        detailPage.servicesDescription,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.servicesDescription
      ),
      ctaEyebrow: readString(
        detailPage.ctaEyebrow,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.ctaEyebrow
      ),
      ctaTitle: readString(detailPage.ctaTitle, SPECIALISTS_PAGE_DEFAULTS.detailPage.ctaTitle),
      ctaDescription: readString(
        detailPage.ctaDescription,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.ctaDescription
      ),
      ctaPrimaryLabel: readString(
        detailPage.ctaPrimaryLabel,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.ctaPrimaryLabel
      ),
      ctaSecondaryLabel: readString(
        detailPage.ctaSecondaryLabel,
        SPECIALISTS_PAGE_DEFAULTS.detailPage.ctaSecondaryLabel
      )
    }
  };
};

export const applySpecialistsPageTemplate = (
  template: string,
  values: Record<string, string | number>
) => template.replace(/\{(\w+)\}/g, (_, token: string) => String(values[token] ?? ''));

export const getSpecialistsPageContent = cache(async (): Promise<SpecialistsPageContent> => {
  try {
    const bootstrap = await getClientBootstrap();
    const siteContent = asObjectRecord(asObjectRecord(bootstrap.config.extra).siteContent);
    return readSpecialistsPageContent(siteContent.specialistsPage);
  } catch {
    return SPECIALISTS_PAGE_DEFAULTS;
  }
});
