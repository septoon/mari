import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ServiceCard } from '@/components/cards/service-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { createPageMetadata, siteSeoConfig } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export async function generateStaticParams() {
  const catalog = await getLiveCatalog();
  return catalog.serviceCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const catalog = await getLiveCatalog();
  const item = catalog.serviceCategories.find((entry) => entry.slug === category);

  if (!item) {
    return createPageMetadata({
      title: 'Категория услуг',
      description: 'Категория услуг МАРИ.',
      path: '/services',
    });
  }

  return createPageMetadata({
    title: `${item.name} в ${siteSeoConfig.city}`,
    description: `${item.description} В салоне красоты МАРИ в ${siteSeoConfig.city}: описание услуг, цены и онлайн-запись.`,
    path: `/services/${item.slug}`,
  });
}

export default async function ServiceCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const catalog = await getLiveCatalog();
  const item = catalog.serviceCategories.find((entry) => entry.slug === category);

  if (!item) {
    notFound();
  }

  const hero = resolveSitePageHero('serviceCategory', catalog.bootstrap.config.extra, {
    categoryEyebrow: item.eyebrow,
    categoryName: item.name,
    categoryDescription: item.description,
    categoryHeroText: item.heroText,
    servicesCount: item.services.length,
  });
  const showHero = isSiteBlockVisible(catalog.bootstrap.config.extra, SITE_BLOCK_KEYS.pageHero('serviceCategory'));
  const section = item.sectionId
    ? catalog.serviceSections.find((entry) => entry.id === item.sectionId) ?? null
    : null;

  return (
    <main className="pb-14">
      <Container>
        {showHero ? (
          <PageHero
            eyebrow={hero.eyebrow}
            title={hero.title}
            description={hero.description}
            imageUrl={item.imageUrl || hero.imageUrl}
            imageAlt={item.name}
            breadcrumbs={[
              { label: 'Главная', href: '/' },
              { label: 'Услуги', href: '/services' },
              ...(section ? [{ label: section.name, href: `/services/section/${section.slug}` }] : []),
              { label: item.name },
            ]}
            actions={
              <>
                <ButtonLink href="/booking">Записаться</ButtonLink>
                {section ? (
                  <ButtonLink href={`/services/section/${section.slug}`} variant="secondary">
                    К разделу
                  </ButtonLink>
                ) : (
                  <ButtonLink href="/services" variant="secondary">
                    Все категории
                  </ButtonLink>
                )}
              </>
            }
            details={[
              `${item.services.length} услуг в категории.`,
              'Выберите процедуру по задаче, времени и формату визита.',
            ]}
          />
        ) : null}

        <section className="mt-16">
          <SectionHeading
            eyebrow="Услуги категории"
            title="Выберите конкретную услугу."
            description="У каждой карточки есть краткое описание, длительность, ориентир по стоимости и переход к записи."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {item.services.map((service) => (
              <ServiceCard
                key={service.id}
                href={`/services/${service.categorySlug}/${service.slug}`}
                categoryName={item.name}
                name={service.displayName}
                excerpt={service.teaser}
                durationMinutes={Math.round(service.durationSec / 60)}
                priceFrom={service.priceMin}
                imageUrl={service.imageUrl || item.imageUrl || null}
              />
            ))}
          </div>
        </section>
      </Container>

      <CtaPanel
        eyebrow="Следующий шаг"
        title="После выбора категории остаётся перейти к нужной услуге."
        description="Можно открыть карточку процедуры, посмотреть цену и сразу подобрать удобное время."
        actions={
          <>
            <ButtonLink href="/booking">Записаться</ButtonLink>
            <ButtonLink href="/prices" variant="secondary">
              Смотреть цены
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
