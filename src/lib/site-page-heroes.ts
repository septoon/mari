type SitePageHeroFields = {
  eyebrow?: string;
  title: string;
  description: string;
};

export type SitePageHeroKey =
  | 'about'
  | 'booking'
  | 'careers'
  | 'contacts'
  | 'gallery'
  | 'giftCards'
  | 'masters'
  | 'masterDetails'
  | 'news'
  | 'newsArticle'
  | 'offers'
  | 'prices'
  | 'services'
  | 'serviceCategory'
  | 'serviceDetails';

type SitePageHeroOverrides = Partial<SitePageHeroFields>;

type SitePageHeroVariables = Record<string, string | number | null | undefined>;

const SITE_PAGE_HERO_KEYS: SitePageHeroKey[] = [
  'about',
  'booking',
  'careers',
  'contacts',
  'gallery',
  'giftCards',
  'masters',
  'masterDetails',
  'news',
  'newsArticle',
  'offers',
  'prices',
  'services',
  'serviceCategory',
  'serviceDetails'
];

const SITE_PAGE_HERO_DEFAULTS: Record<SitePageHeroKey, SitePageHeroFields> = {
  about: {
    eyebrow: 'О салоне',
    title: 'MARI — салон, в котором красота ощущается спокойно и естественно.',
    description: 'Мы соединяем сильную экспертизу мастеров, тёплый сервис и пространство, куда хочется возвращаться.'
  },
  booking: {
    eyebrow: 'Запись',
    title: 'Онлайн-запись в MARI.',
    description: 'Выберите услугу, специалиста и удобное время для визита на отдельной странице записи.'
  },
  careers: {
    eyebrow: 'Вакансии',
    title: 'Присоединяйтесь к команде MARI.',
    description:
      'Ищем мастеров и сервисных специалистов, которым близки аккуратный подход, уважение к гостю и любовь к красивому результату.'
  },
  contacts: {
    eyebrow: 'Контакты',
    title: 'Контакты MARI.',
    description: 'Позвоните, постройте маршрут или перейдите на отдельную страницу записи, если уже планируете визит.'
  },
  gallery: {
    eyebrow: 'Галерея',
    title: 'Галерея настроения, образов и пространства MARI.',
    description: 'Собрали здесь детали, которые передают атмосферу салона, характер процедур и наше отношение к красоте.'
  },
  giftCards: {
    eyebrow: 'Подарочные сертификаты',
    title: 'Подарочные сертификаты MARI.',
    description: 'Выберите номинал, формат подарка и подарите близкому красивый визит в салон.'
  },
  masters: {
    eyebrow: 'Специалисты',
    title: 'Специалисты, которым доверяют постоянные гости.',
    description: 'Познакомьтесь со специалистами MARI, их направлениями и услугами, на которые можно записаться.'
  },
  masterDetails: {
    eyebrow: '{masterSpecialty}',
    title: '{masterName}',
    description: '{masterSummary}'
  },
  news: {
    eyebrow: 'Новости',
    title: 'Новости салона, сезонные предложения и важные обновления.',
    description: 'Здесь рассказываем о новых процедурах, пространствах, форматах ухода и приятных изменениях в MARI.'
  },
  newsArticle: {
    eyebrow: '{newsCategory}',
    title: '{newsTitle}',
    description: '{newsExcerpt}'
  },
  offers: {
    eyebrow: 'Акции',
    title: 'Специальные предложения MARI.',
    description:
      'Здесь собраны выгодные форматы визитов, бонусы и идеи для тех, кто хочет попробовать больше за один визит.'
  },
  prices: {
    eyebrow: 'Цены',
    title: 'Цены без сложных условий.',
    description: 'Смотрите услуги, длительность и ориентир по стоимости, чтобы сразу спланировать визит.'
  },
  services: {
    eyebrow: 'Услуги',
    title: 'Каталог услуг MARI.',
    description: 'Выберите направление, сравните процедуры по времени и стоимости и перейдите к записи в пару шагов.'
  },
  serviceCategory: {
    eyebrow: '{categoryEyebrow}',
    title: '{categoryName}',
    description: '{categoryHeroText}'
  },
  serviceDetails: {
    eyebrow: '{categoryEyebrow}',
    title: '{serviceName}',
    description: '{serviceTeaser}'
  }
};

const asObjectRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const isSitePageHeroKey = (value: string): value is SitePageHeroKey =>
  SITE_PAGE_HERO_KEYS.includes(value as SitePageHeroKey);

const readSitePageHeroOverrides = (extra: Record<string, unknown>): Partial<Record<SitePageHeroKey, SitePageHeroOverrides>> => {
  const source = asObjectRecord(extra.pageHero);
  const result: Partial<Record<SitePageHeroKey, SitePageHeroOverrides>> = {};

  for (const [key, rawValue] of Object.entries(source)) {
    if (!isSitePageHeroKey(key)) {
      continue;
    }

    const value = asObjectRecord(rawValue);
    const next: SitePageHeroOverrides = {};

    if (typeof value.eyebrow === 'string') {
      next.eyebrow = value.eyebrow;
    }
    if (typeof value.title === 'string') {
      next.title = value.title;
    }
    if (typeof value.description === 'string') {
      next.description = value.description;
    }

    if (Object.keys(next).length > 0) {
      result[key] = next;
    }
  }

  return result;
};

const applyTemplate = (template: string | undefined, variables: SitePageHeroVariables) => {
  if (!template) {
    return '';
  }

  return template
    .replace(/\{([a-zA-Z0-9_]+)\}/g, (_match, token: string) => {
      const value = variables[token];
      return value === null || value === undefined ? '' : String(value);
    })
    .replace(/\s+([,.:;!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const pickTemplate = (
  overrideValue: string | undefined,
  defaultValue: string | undefined
) => (overrideValue?.trim() ? overrideValue : defaultValue);

export const resolveSitePageHero = (
  key: SitePageHeroKey,
  extra: Record<string, unknown> | null | undefined,
  variables: SitePageHeroVariables = {}
): SitePageHeroFields => {
  const defaults = SITE_PAGE_HERO_DEFAULTS[key];
  const overrides = extra ? readSitePageHeroOverrides(extra)[key] : undefined;

  const eyebrow =
    applyTemplate(pickTemplate(overrides?.eyebrow, defaults.eyebrow), variables) ||
    applyTemplate(defaults.eyebrow, variables) ||
    undefined;
  const title =
    applyTemplate(pickTemplate(overrides?.title, defaults.title), variables) ||
    applyTemplate(defaults.title, variables) ||
    defaults.title;
  const description =
    applyTemplate(pickTemplate(overrides?.description, defaults.description), variables) ||
    applyTemplate(defaults.description, variables) ||
    defaults.description;

  return {
    ...(eyebrow ? { eyebrow } : {}),
    title,
    description
  };
};
