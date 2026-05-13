import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Clock3, Receipt, UserRound } from 'lucide-react';

import { MasterCard } from '@/components/cards/master-card';
import { ServiceCard } from '@/components/cards/service-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { formatCurrency } from '@/lib/format';
import { createPageMetadata, siteSeoConfig } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export async function generateStaticParams() {
  const catalog = await getLiveCatalog();
  return catalog.services.map((service) => ({
    category: service.categorySlug,
    service: service.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; service: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const catalog = await getLiveCatalog();
  if (!isSiteBlockVisible(catalog.bootstrap.config.extra, SITE_BLOCK_KEYS.page('services'))) {
    notFound();
  }
  const service = catalog.services.find(
    (item) => item.categorySlug === resolved.category && item.slug === resolved.service,
  );

  if (!service) {
    return createPageMetadata({
      title: 'Услуга',
      description: 'Страница услуги МАРИ.',
      path: '/services',
    });
  }

  return createPageMetadata({
    title: `${service.displayName} в ${siteSeoConfig.city}`,
    description: `${service.teaser} В МАРИ в ${siteSeoConfig.city}: от ${formatCurrency(service.priceMin)}, ${Math.round(service.durationSec / 60)} мин и удобная онлайн-запись.`,
    path: `/services/${service.categorySlug}/${service.slug}`,
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ category: string; service: string }>;
}) {
  const resolved = await params;
  const catalog = await getLiveCatalog();
  const service = catalog.services.find(
    (item) => item.categorySlug === resolved.category && item.slug === resolved.service,
  );

  if (!service) {
    notFound();
  }

  const category = catalog.serviceCategories.find((item) => item.slug === service.categorySlug);
  const section = category?.sectionId
    ? catalog.serviceSections.find((item) => item.id === category.sectionId) ?? null
    : null;
  const masters = catalog.specialists.filter((specialist) =>
    specialist.services.some((item) => item.id === service.id),
  );
  const relatedServices = catalog.services
    .filter((item) => item.category.id === service.category.id && item.id !== service.id)
    .slice(0, 4);
  const hero = resolveSitePageHero('serviceDetails', catalog.bootstrap.config.extra, {
    categoryEyebrow: category?.eyebrow ?? service.category.name,
    categoryName: category?.name ?? service.category.name,
    serviceName: service.displayName,
    serviceTeaser: service.teaser,
  });
  const showHero = isSiteBlockVisible(catalog.bootstrap.config.extra, SITE_BLOCK_KEYS.pageHero('serviceDetails'));

  return (
    <main className="pb-14">
      <Container>
        {showHero ? (
          <PageHero
            eyebrow={hero.eyebrow}
            title={hero.title}
            description={hero.description}
            imageUrl={service.imageUrl || category?.imageUrl || hero.imageUrl}
            imageAlt={service.displayName}
            breadcrumbs={[
              { label: 'Главная', href: '/' },
              { label: 'Услуги', href: '/services' },
              ...(section ? [{ label: section.name, href: `/services/section/${section.slug}` }] : []),
              category
                ? { label: category.name, href: `/services/${category.slug}` }
                : { label: service.category.name, href: '/services' },
              { label: service.displayName },
            ]}
            actions={
              <>
                <ButtonLink href={`/booking?service=${service.slug}`}>Записаться</ButtonLink>
                <ButtonLink href={`/services/${service.categorySlug}`} variant="secondary">
                  Все услуги категории
                </ButtonLink>
              </>
            }
            details={[
              `Длительность ${Math.round(service.durationSec / 60)} мин.`,
              `Стоимость от ${formatCurrency(service.priceMin)}.`,
            ]}
          />
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <article className="surface-card p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">Кратко</p>
            <div className="mt-5 grid gap-4 text-sm text-(--muted)">
              <div className="rounded-[1.5rem] border border-(--line) bg-white/72 p-4">
                <p className="inline-flex items-center gap-2 font-medium text-(--foreground)">
                  <Receipt className="h-4 w-4 text-(--accent-strong)" />
                  Услуга
                </p>
                <p className="mt-3">{service.name}</p>
              </div>
              <div className="rounded-[1.5rem] border border-(--line) bg-white/72 p-4">
                <p className="inline-flex items-center gap-2 font-medium text-(--foreground)">
                  <Clock3 className="h-4 w-4 text-(--accent-strong)" />
                  Длительность
                </p>
                <p className="mt-3">{Math.round(service.durationSec / 60)} мин</p>
              </div>
              <div className="rounded-[1.5rem] border border-(--line) bg-white/72 p-4">
                <p className="inline-flex items-center gap-2 font-medium text-(--foreground)">
                  <UserRound className="h-4 w-4 text-(--accent-strong)" />
                  Специалисты
                </p>
                <p className="mt-3">{masters.length} специалистов выполняют эту услугу</p>
              </div>
            </div>
          </article>

          <article className="surface-card p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">О процедуре</p>
            <h2 className="mt-4 font-serif text-4xl text-(--ink)">
              Всё важное о процедуре в одном месте.
            </h2>
            <p className="mt-4 text-sm leading-7 text-(--muted)">
              Здесь собраны описание, ориентир по стоимости, длительность и список специалистов,
              чтобы вы могли быстро принять решение о визите.
            </p>
            <div className="mt-6 rounded-[1.5rem] border border-(--line) bg-white/72 p-5 text-sm leading-7 text-(--muted)">
              {service.description?.trim() ||
                'Подробности по процедуре подскажет мастер перед началом визита. Ниже можно выбрать специалиста и перейти к записи.'}
            </div>
          </article>
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Специалисты"
            title="Кто выполняет эту услугу."
            description="Выберите специалиста, который работает с этой процедурой, и перейдите к удобному времени."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {masters.map((master) => (
              <MasterCard
                key={master.staffId}
                href={`/masters/${master.slug}`}
                name={master.name}
                specialty={master.specialtyLabel}
                summary={master.summary}
                servicesCount={master.services.length}
                categories={master.categoryNames}
                imageUrl={master.photo?.preferredUrl ?? null}
              />
            ))}
          </div>
        </section>

        {relatedServices.length ? (
          <section className="mt-16">
            <SectionHeading
              eyebrow="Похожие услуги"
              title="Другие услуги этой категории."
              description="Если хотите сравнить варианты, начните с похожих процедур в этом же направлении."
            />
            <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
              {relatedServices.map((item) => (
                <ServiceCard
                  key={item.id}
                  href={`/services/${item.categorySlug}/${item.slug}`}
                  categoryName={item.category.name}
                  name={item.displayName}
                  excerpt={item.teaser}
                  durationMinutes={Math.round(item.durationSec / 60)}
                  priceFrom={item.priceMin}
                  imageUrl={item.imageUrl || item.category.imageUrl || null}
                />
              ))}
            </div>
          </section>
        ) : null}
      </Container>

      <CtaPanel
        eyebrow="Запись на услугу"
        title="Осталось выбрать мастера и удобное время."
        description="Если вы уже определились с процедурой, перейдите к записи и соберите визит в несколько шагов."
        actions={
          <>
            <ButtonLink href={`/booking?service=${service.slug}`}>Записаться на услугу</ButtonLink>
            <ButtonLink href="/prices" variant="secondary">
              Смотреть цены
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
