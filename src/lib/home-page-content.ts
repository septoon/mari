import { cache } from 'react';

import { getClientBootstrap } from '@/lib/api/backend';

export type HomePagePillar = {
  title: string;
  text: string;
};

export type HomePageHighlight = {
  title: string;
  description: string;
};

export type HomePageContent = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
    visualLabel: string;
    visualTitle: string;
    visualSubtitle: string;
  };
  categories: {
    eyebrow: string;
    title: string;
    description: string;
    actionLabel: string;
  };
  valuePillars: {
    eyebrow: string;
    title: string;
    description: string;
    items: HomePagePillar[];
  };
  featuredServices: {
    eyebrow: string;
    title: string;
    description: string;
    actionLabel: string;
  };
  featuredSpecialists: {
    eyebrow: string;
    title: string;
    description: string;
    actionLabel: string;
  };
  contacts: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
  highlights: HomePageHighlight[];
  bottomCta: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCtaLabel: string;
    secondaryCtaLabel: string;
  };
};

export const HOME_PAGE_DEFAULTS: HomePageContent = {
  hero: {
    eyebrow: 'Салон красоты MARI',
    title: 'Услуги, специалисты\nи запись\nв одном месте.',
    description:
      'Здесь можно выбрать услугу, познакомиться со специалистами, посмотреть цены и сразу подобрать удобное время для визита.',
    primaryCtaLabel: 'Записаться',
    secondaryCtaLabel: 'Выбрать услугу',
    visualLabel: 'MARI',
    visualTitle: 'Пространство для ухода, цвета и точной работы с образом.',
    visualSubtitle:
      'Путь от первого знакомства до записи был коротким, понятным и приятным.'
  },
  categories: {
    eyebrow: 'Популярные направления',
    title: 'Выберите направление, с которого хотите начать.',
    description:
      'Волосы, ногтевой сервис, уход за лицом, брови, ресницы и другие процедуры собраны в удобный каталог.',
    actionLabel: 'Все услуги'
  },
  valuePillars: {
    eyebrow: 'Почему выбирают нас',
    title: 'В MARI важны комфорт, точность и уважение к вашему времени.',
    description:
      'Мы убрали всё лишнее и оставили только то, что помогает быстро принять решение и записаться без лишних шагов.',
    items: [
      {
        title: 'Понятный выбор',
        text: 'На сайте легко сравнить услуги, посмотреть длительность и сразу перейти к записи.'
      },
      {
        title: 'Сильные специалисты',
        text: 'У каждого специалиста есть профиль с направлениями работы и удобным переходом к записи.'
      },
      {
        title: 'Честные цены',
        text: 'В карточках сразу видно ориентир по стоимости и длительности, без сложных условий.'
      },
      {
        title: 'Комфорт после записи',
        text: 'В личном кабинете можно посмотреть визиты, обновить профиль и управлять ближайшими записями.'
      }
    ]
  },
  featuredServices: {
    eyebrow: 'Услуги',
    title: 'Популярные процедуры, которые выбирают чаще всего.',
    description:
      'У каждой услуги есть краткое описание, длительность, ориентир по стоимости и переход к записи.',
    actionLabel: 'Смотреть цены'
  },
  featuredSpecialists: {
    eyebrow: 'Специалисты',
    title: 'Специалисты, которым доверяют постоянные гости.',
    description:
      'Познакомьтесь со специалистами, их направлениями и выберите того, кто подходит именно вам.',
    actionLabel: 'Все специалисты'
  },
  contacts: {
    eyebrow: 'Салон MARI',
    title: 'Контакты, запись и поддержка собраны в одном месте.',
    description:
      'Можно позвонить, посмотреть адрес, выбрать услугу и сразу перейти к записи без долгих переходов по сайту.',
    primaryCtaLabel: 'Записаться',
    secondaryCtaLabel: 'Контакты салона'
  },
  highlights: [
    {
      title: 'Онлайн-запись',
      description:
        'Выберите услуги, специалиста и удобное время в одном аккуратном сценарии записи.'
    },
    {
      title: 'Личный кабинет',
      description:
        'После входа можно посмотреть историю визитов, обновить профиль и управлять записями.'
    },
    {
      title: 'Спокойная атмосфера',
      description:
        'Тёплый визуальный язык сайта передаёт настроение салона и помогает сосредоточиться на выборе.'
    }
  ],
  bottomCta: {
    eyebrow: 'Запись',
    title: 'Выберите услугу, специалиста и удобное время для визита.',
    description:
      'Основные разделы сайта собраны так, чтобы от знакомства с салоном вы могли сразу перейти к записи.',
    primaryCtaLabel: 'Записаться',
    secondaryCtaLabel: 'Выбрать специалиста'
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

const readPillars = (value: unknown) => {
  if (!Array.isArray(value)) {
    return HOME_PAGE_DEFAULTS.valuePillars.items;
  }

  return HOME_PAGE_DEFAULTS.valuePillars.items.map((item, index) => {
    const current = asObjectRecord(value[index]);
    return {
      title: readString(current.title, item.title),
      text: readString(current.text, item.text)
    };
  });
};

const readHighlights = (value: unknown) => {
  if (!Array.isArray(value)) {
    return HOME_PAGE_DEFAULTS.highlights;
  }

  return HOME_PAGE_DEFAULTS.highlights.map((item, index) => {
    const current = asObjectRecord(value[index]);
    return {
      title: readString(current.title, item.title),
      description: readString(current.description, item.description)
    };
  });
};

export const readHomePageContent = (value: unknown): HomePageContent => {
  const source = asObjectRecord(value);
  const hero = asObjectRecord(source.hero);
  const categories = asObjectRecord(source.categories);
  const valuePillars = asObjectRecord(source.valuePillars);
  const featuredServices = asObjectRecord(source.featuredServices);
  const featuredSpecialists = asObjectRecord(source.featuredSpecialists);
  const contacts = asObjectRecord(source.contacts);
  const bottomCta = asObjectRecord(source.bottomCta);

  return {
    hero: {
      eyebrow: readString(hero.eyebrow, HOME_PAGE_DEFAULTS.hero.eyebrow),
      title: readString(hero.title, HOME_PAGE_DEFAULTS.hero.title),
      description: readString(hero.description, HOME_PAGE_DEFAULTS.hero.description),
      primaryCtaLabel: readString(hero.primaryCtaLabel, HOME_PAGE_DEFAULTS.hero.primaryCtaLabel),
      secondaryCtaLabel: readString(
        hero.secondaryCtaLabel,
        HOME_PAGE_DEFAULTS.hero.secondaryCtaLabel
      ),
      visualLabel: readString(hero.visualLabel, HOME_PAGE_DEFAULTS.hero.visualLabel),
      visualTitle: readString(hero.visualTitle, HOME_PAGE_DEFAULTS.hero.visualTitle),
      visualSubtitle: readString(hero.visualSubtitle, HOME_PAGE_DEFAULTS.hero.visualSubtitle)
    },
    categories: {
      eyebrow: readString(categories.eyebrow, HOME_PAGE_DEFAULTS.categories.eyebrow),
      title: readString(categories.title, HOME_PAGE_DEFAULTS.categories.title),
      description: readString(categories.description, HOME_PAGE_DEFAULTS.categories.description),
      actionLabel: readString(categories.actionLabel, HOME_PAGE_DEFAULTS.categories.actionLabel)
    },
    valuePillars: {
      eyebrow: readString(valuePillars.eyebrow, HOME_PAGE_DEFAULTS.valuePillars.eyebrow),
      title: readString(valuePillars.title, HOME_PAGE_DEFAULTS.valuePillars.title),
      description: readString(
        valuePillars.description,
        HOME_PAGE_DEFAULTS.valuePillars.description
      ),
      items: readPillars(valuePillars.items)
    },
    featuredServices: {
      eyebrow: readString(
        featuredServices.eyebrow,
        HOME_PAGE_DEFAULTS.featuredServices.eyebrow
      ),
      title: readString(featuredServices.title, HOME_PAGE_DEFAULTS.featuredServices.title),
      description: readString(
        featuredServices.description,
        HOME_PAGE_DEFAULTS.featuredServices.description
      ),
      actionLabel: readString(
        featuredServices.actionLabel,
        HOME_PAGE_DEFAULTS.featuredServices.actionLabel
      )
    },
    featuredSpecialists: {
      eyebrow: readString(
        featuredSpecialists.eyebrow,
        HOME_PAGE_DEFAULTS.featuredSpecialists.eyebrow
      ),
      title: readString(
        featuredSpecialists.title,
        HOME_PAGE_DEFAULTS.featuredSpecialists.title
      ),
      description: readString(
        featuredSpecialists.description,
        HOME_PAGE_DEFAULTS.featuredSpecialists.description
      ),
      actionLabel: readString(
        featuredSpecialists.actionLabel,
        HOME_PAGE_DEFAULTS.featuredSpecialists.actionLabel
      )
    },
    contacts: {
      eyebrow: readString(contacts.eyebrow, HOME_PAGE_DEFAULTS.contacts.eyebrow),
      title: readString(contacts.title, HOME_PAGE_DEFAULTS.contacts.title),
      description: readString(contacts.description, HOME_PAGE_DEFAULTS.contacts.description),
      primaryCtaLabel: readString(
        contacts.primaryCtaLabel,
        HOME_PAGE_DEFAULTS.contacts.primaryCtaLabel
      ),
      secondaryCtaLabel: readString(
        contacts.secondaryCtaLabel,
        HOME_PAGE_DEFAULTS.contacts.secondaryCtaLabel
      )
    },
    highlights: readHighlights(source.highlights),
    bottomCta: {
      eyebrow: readString(bottomCta.eyebrow, HOME_PAGE_DEFAULTS.bottomCta.eyebrow),
      title: readString(bottomCta.title, HOME_PAGE_DEFAULTS.bottomCta.title),
      description: readString(bottomCta.description, HOME_PAGE_DEFAULTS.bottomCta.description),
      primaryCtaLabel: readString(
        bottomCta.primaryCtaLabel,
        HOME_PAGE_DEFAULTS.bottomCta.primaryCtaLabel
      ),
      secondaryCtaLabel: readString(
        bottomCta.secondaryCtaLabel,
        HOME_PAGE_DEFAULTS.bottomCta.secondaryCtaLabel
      )
    }
  };
};

export const getHomePageContent = cache(async (): Promise<HomePageContent> => {
  try {
    const bootstrap = await getClientBootstrap();
    const siteContent = asObjectRecord(asObjectRecord(bootstrap.config.extra).siteContent);
    return readHomePageContent(siteContent.homePage);
  } catch {
    return HOME_PAGE_DEFAULTS;
  }
});
