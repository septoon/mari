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
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';

export async function generateStaticParams() {
  const catalog = await getLiveCatalog();
  return catalog.services.map((service) => ({
    category: service.categorySlug,
    service: service.slug
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; service: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const catalog = await getLiveCatalog();
  const service = catalog.services.find(
    (item) => item.categorySlug === resolved.category && item.slug === resolved.service
  );

  if (!service) {
    return createPageMetadata({
      title: 'Услуга',
      description: 'Страница услуги MARI.',
      path: '/services'
    });
  }

  return createPageMetadata({
    title: service.displayName,
    description: service.teaser,
    path: `/services/${service.categorySlug}/${service.slug}`
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
    (item) => item.categorySlug === resolved.category && item.slug === resolved.service
  );

  if (!service) {
    notFound();
  }

  const category = catalog.serviceCategories.find((item) => item.slug === service.categorySlug);
  const masters = catalog.specialists.filter((specialist) =>
    specialist.services.some((item) => item.id === service.id)
  );
  const relatedServices = catalog.services
    .filter((item) => item.category.id === service.category.id && item.id !== service.id)
    .slice(0, 4);

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={category?.eyebrow ?? service.category.name}
          title={service.displayName}
          description={service.teaser}
          breadcrumbs={[
            { label: 'Главная', href: '/' },
            { label: 'Услуги', href: '/services' },
            category ? { label: category.name, href: `/services/${category.slug}` } : { label: service.category.name, href: '/services' },
            { label: service.displayName }
          ]}
          actions={
            <>
              <ButtonLink href={`/booking?service=${service.slug}`}>
                Записаться
              </ButtonLink>
              <ButtonLink href={`/services/${service.categorySlug}`} variant="secondary">
                Все услуги категории
              </ButtonLink>
            </>
          }
          details={[
            `Длительность ${Math.round(service.durationSec / 60)} мин.`,
            `Стоимость от ${formatCurrency(service.priceMin)}.`
          ]}
        />

        <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <article className="surface-card p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Кратко</p>
            <div className="mt-5 grid gap-4 text-sm text-[color:var(--muted)]">
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4">
                <p className="inline-flex items-center gap-2 font-medium text-[color:var(--foreground)]">
                  <Receipt className="h-4 w-4 text-[color:var(--accent-strong)]" />
                  Услуга
                </p>
                <p className="mt-3">{service.name}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4">
                <p className="inline-flex items-center gap-2 font-medium text-[color:var(--foreground)]">
                  <Clock3 className="h-4 w-4 text-[color:var(--accent-strong)]" />
                  Длительность
                </p>
                <p className="mt-3">{Math.round(service.durationSec / 60)} мин</p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4">
                <p className="inline-flex items-center gap-2 font-medium text-[color:var(--foreground)]">
                  <UserRound className="h-4 w-4 text-[color:var(--accent-strong)]" />
                  Специалисты
                </p>
                <p className="mt-3">{masters.length} специалистов выполняют эту услугу</p>
              </div>
            </div>
          </article>

          <article className="surface-card p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">О процедуре</p>
            <h2 className="mt-4 font-serif text-4xl text-[color:var(--ink)]">Всё важное о процедуре в одном месте.</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              Здесь собраны описание, ориентир по стоимости, длительность и список специалистов, чтобы вы могли быстро принять решение о визите.
            </p>
            <div className="mt-6 rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-5 text-sm leading-7 text-[color:var(--muted)]">
              {service.description?.trim() || 'Подробности по процедуре подскажет мастер перед началом визита. Ниже можно выбрать специалиста и перейти к записи.'}
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
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {relatedServices.map((item) => (
                <ServiceCard
                  key={item.id}
                  href={`/services/${item.categorySlug}/${item.slug}`}
                  categoryName={item.category.name}
                  name={item.displayName}
                  excerpt={item.teaser}
                  durationMinutes={Math.round(item.durationSec / 60)}
                  priceFrom={item.priceMin}
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
            <ButtonLink href={`/booking?service=${service.slug}`}>
              Записаться на услугу
            </ButtonLink>
            <ButtonLink href="/prices" variant="secondary">
              Смотреть цены
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
