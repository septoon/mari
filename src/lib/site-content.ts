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

const privacyPolicySectionSchema = z.object({
  id: z.string(),
  title: z.string(),
  paragraphs: z.array(z.string())
});

const privacyPolicyContentSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  summaryEyebrow: z.string().optional(),
  summaryTitle: z.string().optional(),
  operatorLabel: z.string().optional(),
  contactLabel: z.string().optional(),
  addressLabel: z.string().optional(),
  summaryNote: z.string().optional(),
  contactCtaLabel: z.string().optional(),
  bookingConsentLabel: z.string().optional(),
  accountConsentLabel: z.string().optional(),
  cookieBannerTitle: z.string().optional(),
  cookieBannerDescription: z.string().optional(),
  cookieBannerAcceptLabel: z.string().optional(),
  cookieBannerNecessaryLabel: z.string().optional(),
  sections: z.array(privacyPolicySectionSchema).optional()
});

export type PrivacyPolicySection = z.infer<typeof privacyPolicySectionSchema>;
export type PrivacyPolicyContent = {
  eyebrow: string;
  title: string;
  description: string;
  summaryEyebrow: string;
  summaryTitle: string;
  operatorLabel: string;
  contactLabel: string;
  addressLabel: string;
  summaryNote: string;
  contactCtaLabel: string;
  bookingConsentLabel: string;
  accountConsentLabel: string;
  cookieBannerTitle: string;
  cookieBannerDescription: string;
  cookieBannerAcceptLabel: string;
  cookieBannerNecessaryLabel: string;
  sections: PrivacyPolicySection[];
};

const defaultPrivacyPolicy: PrivacyPolicyContent = {
  eyebrow: 'Privacy policy',
  title: 'Политика конфиденциальности',
  description:
    'Какие данные сайт получает, зачем они нужны, как обрабатываются и каким образом пользователь может запросить уточнение, ограничение или удаление.',
  summaryEyebrow: 'Кратко',
  summaryTitle: 'Что важно знать',
  operatorLabel: 'Оператор сайта',
  contactLabel: 'Основной контакт для запросов',
  addressLabel: 'Адрес салона',
  summaryNote:
    'Если вопрос связан с записью или кабинетом, удобнее всего писать с той почты или телефона, которые уже использовались на сайте.',
  contactCtaLabel: 'Задать вопрос',
  bookingConsentLabel:
    'Подтверждаю согласие на обработку персональных данных для оформления записи и ознакомлен(а) с политикой конфиденциальности.',
  accountConsentLabel:
    'Подтверждаю согласие на обработку персональных данных для создания личного кабинета и ознакомлен(а) с политикой конфиденциальности.',
  cookieBannerTitle: 'Сайт использует cookie',
  cookieBannerDescription:
    'Cookie нужны для входа в кабинет, стабильной работы записи и аналитики. Вы можете разрешить аналитику или оставить только необходимые cookie.',
  cookieBannerAcceptLabel: 'Разрешить аналитику',
  cookieBannerNecessaryLabel: 'Только необходимые',
  sections: [
    {
      id: 'policy-scope',
      title: '1. Что регулирует этот документ',
      paragraphs: [
        'Эта страница объясняет, какие данные сайт может получать от посетителя, зачем они нужны и как используются при работе с онлайн-записью, личным кабинетом и обратной связью.',
        'Документ применяется к сайту салона, формам записи, формам входа в кабинет, обращениям по телефону и электронной почте, а также к связанным сервисам аналитики и уведомлений.'
      ]
    },
    {
      id: 'policy-data',
      title: '2. Какие данные могут обрабатываться',
      paragraphs: [
        'Сайт может получать имя, номер телефона, адрес электронной почты, данные о выбранных услугах, специалистах, времени визита, а также сведения, которые пользователь сам указывает в комментарии к записи.',
        'Дополнительно могут обрабатываться технические данные: IP-адрес, сведения о браузере и устройстве, cookie, дата и время визита, адреса посещённых страниц и действия на сайте.'
      ]
    },
    {
      id: 'policy-purpose',
      title: '3. Для чего нужны эти данные',
      paragraphs: [
        'Основные цели: оформить и подтвердить запись, дать доступ к личному кабинету, связаться по вопросам визита, отправить сервисные уведомления, ответить на запрос пользователя и улучшать работу сайта.',
        'Данные не запрашиваются без причины: если сайт просит телефон или почту, это связано либо с записью, либо с идентификацией пользователя, либо с обратной связью.'
      ]
    },
    {
      id: 'policy-basis',
      title: '4. Правовые основания обработки',
      paragraphs: [
        'Данные обрабатываются на основании согласия пользователя, необходимости исполнить запрос пользователя или подготовить оказание услуги, а также для исполнения обязательных требований законодательства.',
        'Если для конкретного действия требуется отдельное согласие, пользователь выражает его через форму сайта, чекбокс, отправку данных или иное явное действие.'
      ]
    },
    {
      id: 'policy-storage',
      title: '5. Передача и хранение данных',
      paragraphs: [
        'Данные могут передаваться только тем сервисам и подрядчикам, без которых невозможно обеспечить запись, авторизацию, техническую работу сайта, аналитику или отправку уведомлений. Передача происходит в пределах задач, для которых данные были собраны.',
        'Данные хранятся только столько, сколько это нужно для работы сервиса, выполнения записи, обслуживания клиента, соблюдения обязательств и разрешения спорных ситуаций.'
      ]
    },
    {
      id: 'policy-cookies',
      title: '6. Cookie и аналитика',
      paragraphs: [
        'Сайт может использовать cookie и технические идентификаторы, чтобы сохранять сессию, понимать, какие страницы работают лучше, и оценивать стабильность записи и личного кабинета.',
        'Если пользователь ограничивает cookie в браузере или выбирает только необходимые cookie, часть аналитики не будет загружаться, но базовые функции сайта останутся доступны.'
      ]
    },
    {
      id: 'policy-rights',
      title: '7. Права пользователя',
      paragraphs: [
        'Пользователь может запросить уточнение, обновление, ограничение обработки или удаление своих данных, если это не противоречит обязательным требованиям закона и факту уже оказанной услуги.',
        'Также пользователь может отозвать согласие на обработку в той части, где обработка строится именно на согласии.'
      ]
    },
    {
      id: 'policy-updates',
      title: '8. Изменение политики',
      paragraphs: [
        'Политика может обновляться при изменении сайта, процессов записи, состава сервисов или требований закона. Актуальная версия всегда публикуется на этой странице.',
        'Если изменения влияют на существенные условия обработки данных, новая редакция начинает применяться с момента публикации на сайте.'
      ]
    }
  ]
};

const asObjectRecord = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
};

const readPrivacyPolicyContent = (value: unknown): PrivacyPolicyContent => {
  const parsed = privacyPolicyContentSchema.safeParse(value);
  if (!parsed.success) {
    return defaultPrivacyPolicy;
  }

  return {
    eyebrow: parsed.data.eyebrow ?? defaultPrivacyPolicy.eyebrow,
    title: parsed.data.title ?? defaultPrivacyPolicy.title,
    description: parsed.data.description ?? defaultPrivacyPolicy.description,
    summaryEyebrow: parsed.data.summaryEyebrow ?? defaultPrivacyPolicy.summaryEyebrow,
    summaryTitle: parsed.data.summaryTitle ?? defaultPrivacyPolicy.summaryTitle,
    operatorLabel: parsed.data.operatorLabel ?? defaultPrivacyPolicy.operatorLabel,
    contactLabel: parsed.data.contactLabel ?? defaultPrivacyPolicy.contactLabel,
    addressLabel: parsed.data.addressLabel ?? defaultPrivacyPolicy.addressLabel,
    summaryNote: parsed.data.summaryNote ?? defaultPrivacyPolicy.summaryNote,
    contactCtaLabel: parsed.data.contactCtaLabel ?? defaultPrivacyPolicy.contactCtaLabel,
    bookingConsentLabel: parsed.data.bookingConsentLabel ?? defaultPrivacyPolicy.bookingConsentLabel,
    accountConsentLabel: parsed.data.accountConsentLabel ?? defaultPrivacyPolicy.accountConsentLabel,
    cookieBannerTitle: parsed.data.cookieBannerTitle ?? defaultPrivacyPolicy.cookieBannerTitle,
    cookieBannerDescription:
      parsed.data.cookieBannerDescription ?? defaultPrivacyPolicy.cookieBannerDescription,
    cookieBannerAcceptLabel:
      parsed.data.cookieBannerAcceptLabel ?? defaultPrivacyPolicy.cookieBannerAcceptLabel,
    cookieBannerNecessaryLabel:
      parsed.data.cookieBannerNecessaryLabel ?? defaultPrivacyPolicy.cookieBannerNecessaryLabel,
    sections: parsed.data.sections ?? defaultPrivacyPolicy.sections
  };
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
  policy: PrivacyPolicyContent;
}> => {
  try {
    const bootstrap = await getClientBootstrap();
    const siteContent = asObjectRecord(asObjectRecord(bootstrap.config.extra).siteContent);

    return {
      offers: readCollection(siteContent, 'offers', z.array(offerItemSchema), defaultOffers),
      news: readCollection(siteContent, 'news', z.array(newsArticleSchema), defaultNews),
      locations: readCollection(siteContent, 'locations', z.array(locationProfileSchema), defaultLocations),
      policy: readPrivacyPolicyContent(siteContent.policy)
    };
  } catch {
    return {
      offers: defaultOffers,
      news: defaultNews,
      locations: defaultLocations,
      policy: defaultPrivacyPolicy
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

export const getSitePrivacyPolicyContent = async () => (await getSiteCollections()).policy;
