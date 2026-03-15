import 'server-only';

import { cache } from 'react';

import type { ContactPoint, Service, SpecialistCard } from '@/lib/api/contracts';
import { getLandingData } from '@/lib/api/backend';
import { siteConfig } from '@/lib/site';

const translitMap: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'i',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'cz', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
};

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .split('')
    .map((char) => translitMap[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const buildUniqueSlugs = <T>(items: T[], pickValue: (item: T) => string) => {
  const counts = new Map<string, number>();

  return items.map((item) => {
    const base = slugify(pickValue(item)) || 'item';
    const next = (counts.get(base) ?? 0) + 1;
    counts.set(base, next);
    return next === 1 ? base : `${base}-${next}`;
  });
};

const categoryMeta: Record<string, { eyebrow: string; description: string; heroText: string }> = {
  'Брови': {
    eyebrow: 'Brows',
    description: 'Коррекция, окрашивание и ламинирование бровей.',
    heroText: 'Аккуратная форма, мягкий оттенок и уход, который подчёркивает естественную выразительность.'
  },
  'Косметология': {
    eyebrow: 'Face care',
    description: 'Уходовые и аппаратные процедуры для кожи лица.',
    heroText: 'Программы для сияния, тонуса и комфорта кожи в повседневном ритме.'
  },
  'Косметология - Аппаратные процедуры': {
    eyebrow: 'Hardware care',
    description: 'Аппаратные косметологические процедуры.',
    heroText: 'Аппаратные методики для точной работы с тоном, текстурой и упругостью кожи.'
  },
  'Косметология - Пилинг': {
    eyebrow: 'Peels',
    description: 'Пилинги и обновляющие косметологические протоколы.',
    heroText: 'Деликатное обновление кожи для ровного тона, свежести и мягкого сияния.'
  },
  'Лазерная эпиляция 3Д': {
    eyebrow: 'Laser',
    description: 'Лазерная эпиляция по зонам и комбо-наборам.',
    heroText: 'Комфортные процедуры для гладкой кожи и понятного графика ухода.'
  },
  'Маникюр': {
    eyebrow: 'Manicure',
    description: 'Маникюр, покрытия, укрепление и сопутствующие nail-услуги.',
    heroText: 'Маникюр с чистой формой, стойким покрытием и спокойной палитрой оттенков.'
  },
  'Массаж лица': {
    eyebrow: 'Face massage',
    description: 'Массажные техники для лица, шеи и декольте.',
    heroText: 'Массажные техники для расслабления, тонуса и более свежего контура лица.'
  },
  'Наращивание ресниц': {
    eyebrow: 'Lashes',
    description: 'Наращивание ресниц, объёмы и снятие.',
    heroText: 'Ресницы с аккуратной посадкой, комфортом в носке и выразительным результатом.'
  },
  'Окрашивание': {
    eyebrow: 'Color',
    description: 'Окрашивание волос: корни, тон, сложные техники.',
    heroText: 'От мягкого обновления оттенка до сложных техник с деликатной глубиной цвета.'
  },
  'Педикюр': {
    eyebrow: 'Pedicure',
    description: 'Педикюр, обработка стоп и сопутствующий уход.',
    heroText: 'Уход для стоп и ногтей с аккуратной обработкой и ощущением лёгкости после визита.'
  },
  'Перманент': {
    eyebrow: 'Permanent',
    description: 'Перманентный макияж и межресничка.',
    heroText: 'Деликатный перманент для тех, кто ценит выразительность и аккуратный результат.'
  },
  'Проколы': {
    eyebrow: 'Piercing',
    description: 'Проколы ушей, хряща и носа.',
    heroText: 'Аккуратные проколы в спокойной атмосфере и с понятными рекомендациями по уходу.'
  },
  'Стрижки женские': {
    eyebrow: 'Women haircuts',
    description: 'Женские стрижки по длине и форме.',
    heroText: 'Форма, которая красиво отрастает, легко укладывается и подходит вашему ритму.'
  },
  'Стрижки мужские': {
    eyebrow: 'Men haircuts',
    description: 'Мужские стрижки и сервис бороды.',
    heroText: 'Точный мужской сервис с удобной длиной, чистой формой и аккуратной подачей.'
  },
  'Укладка': {
    eyebrow: 'Styling',
    description: 'Укладки по длине волос.',
    heroText: 'Укладки для повседневного образа, события или спокойного вечернего выхода.'
  },
  'Уход за волосами': {
    eyebrow: 'Hair care',
    description: 'Уход за волосами и восстановление.',
    heroText: 'Восстановление, блеск и мягкость волос без ощущения перегруженности.'
  },
  'Макияж': {
    eyebrow: 'Makeup',
    description: 'Вечерний, свадебный и комплексный макияж.',
    heroText: 'Макияж для дня, вечера и особых событий с аккуратным акцентом на черты лица.'
  },
  'Электроэпиляция': {
    eyebrow: 'Electroepilation',
    description: 'Электроэпиляция по минутам и зонам.',
    heroText: 'Точечная работа для гладкой кожи и аккуратного результата на деликатных зонах.'
  }
};

export type LiveServiceCategory = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  heroText: string;
  services: LiveService[];
};

export type LiveService = Service & {
  slug: string;
  categorySlug: string;
  displayName: string;
  teaser: string;
  specialistSlugs: string[];
};

export type LiveSpecialist = SpecialistCard & {
  slug: string;
  specialtyLabel: string;
  summary: string;
  serviceIds: string[];
  categoryNames: string[];
};

export type LiveSalon = {
  name: string;
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  workingHours: string;
  mapUrl?: string;
};

const mapSalon = (contact: ContactPoint | null): LiveSalon => {
  const phone = contact?.phones.find((item) => item.primary) ?? contact?.phones[0];
  const address = contact?.addresses[0];
  const hours = contact?.workingHours
    ?.slice(0, 3)
    .map((item) => `${item.open} - ${item.close}`)
    .join(' · ');

  return {
    name: contact?.publicName || contact?.name || siteConfig.shortName,
    phone: phone?.display || phone?.e164 || siteConfig.phone,
    phoneHref: phone?.e164 ? `tel:${phone.e164}` : siteConfig.phoneHref,
    email: contact?.emails?.[0] || siteConfig.email,
    address:
      [address?.line1, address?.city, address?.comment].filter(Boolean).join(', ') ||
      siteConfig.address,
    workingHours: hours || 'Ежедневно, по предварительной записи',
    mapUrl: contact?.mapUrl
  };
};

const buildServiceTeaser = (service: Service, specialistCount: number) => {
  const base = service.description?.trim();

  if (base) {
    return base;
  }

  return [
    `Услуга категории «${service.category.name}».`,
    `Длительность ${Math.round(service.durationSec / 60)} мин.`,
    specialistCount > 0 ? `Доступна у ${specialistCount} мастеров.` : 'Запись доступна онлайн.'
  ].join(' ');
};

const buildSpecialistSummary = (specialist: SpecialistCard, categoryNames: string[]) => {
  if (specialist.info?.trim()) {
    return specialist.info.trim();
  }

  const scope = categoryNames.slice(0, 3).join(', ');
  return scope
    ? `Работает по направлениям: ${scope}.`
    : 'Специалист салона Mari.';
};

export const getLiveCatalog = cache(async () => {
  const landing = await getLandingData();
  const visibleSpecialists = landing.bootstrap.specialists.filter(
    (item) => item.isVisible && item.isActive && !item.firedAt
  );
  const activeServices = landing.services.filter((item) => item.isActive);

  const categorySource = activeServices.reduce<Array<{ id: string; name: string }>>((acc, service) => {
    if (!acc.some((item) => item.id === service.category.id)) {
      acc.push({ id: service.category.id, name: service.category.name });
    }
    return acc;
  }, []);
  const categorySlugs = buildUniqueSlugs(categorySource, (item) => item.name);
  const categorySlugById = new Map(categorySource.map((item, index) => [item.id, categorySlugs[index]]));

  const specialistSlugs = buildUniqueSlugs(visibleSpecialists, (item) => item.name);
  const specialistSlugById = new Map(
    visibleSpecialists.map((item, index) => [item.staffId, specialistSlugs[index]])
  );

  const serviceSlugsByCategory = new Map<string, Map<string, number>>();
  const services: LiveService[] = activeServices.map((service) => {
    const categorySlug = categorySlugById.get(service.category.id) ?? slugify(service.category.name);
    const currentMap = serviceSlugsByCategory.get(categorySlug) ?? new Map<string, number>();
    const base = slugify(service.nameOnline || service.name) || 'service';
    const next = (currentMap.get(base) ?? 0) + 1;
    currentMap.set(base, next);
    serviceSlugsByCategory.set(categorySlug, currentMap);
    const slug = next === 1 ? base : `${base}-${next}`;
    const specialistSlugs = visibleSpecialists
      .filter((specialist) => specialist.services.some((item) => item.id === service.id))
      .map((specialist) => specialistSlugById.get(specialist.staffId)!)
      .filter(Boolean);

    return {
      ...service,
      slug,
      categorySlug,
      displayName: service.nameOnline?.trim() || service.name,
      teaser: buildServiceTeaser(service, specialistSlugs.length),
      specialistSlugs
    };
  });

  const servicesById = new Map(services.map((item) => [item.id, item]));

  const specialists: LiveSpecialist[] = visibleSpecialists.map((specialist) => {
    const serviceIds = specialist.services.map((item) => item.id);
    const categoryNames = Array.from(new Set(specialist.services.map((item) => item.category.name)));

    return {
      ...specialist,
      slug: specialistSlugById.get(specialist.staffId) ?? slugify(specialist.name),
      specialtyLabel: specialist.specialty?.trim() || categoryNames[0] || 'Мастер Mari',
      summary: buildSpecialistSummary(specialist, categoryNames),
      serviceIds,
      categoryNames
    };
  });

  const serviceCategories: LiveServiceCategory[] = categorySource.map((category) => {
    const meta = categoryMeta[category.name] ?? {
      eyebrow: category.name,
      description: `Услуги категории «${category.name}».`,
      heroText: `Реальный каталог Mari по направлению «${category.name}».`
    };

    return {
      ...category,
      slug: categorySlugById.get(category.id) ?? slugify(category.name),
      eyebrow: meta.eyebrow,
      description: meta.description,
      heroText: meta.heroText,
      services: services.filter((service) => service.category.id === category.id)
    };
  });

  const primaryContact =
    landing.bootstrap.config.contacts.find((item) => item.isPrimary) ??
    landing.bootstrap.config.contacts[0] ??
    null;
  const salon = mapSalon(primaryContact);

  return {
    ...landing,
    salon,
    services,
    servicesById,
    specialists,
    serviceCategories
  };
});
