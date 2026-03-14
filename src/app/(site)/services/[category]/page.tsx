import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ServiceCard } from '@/components/cards/service-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';

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
      description: 'Категория услуг MARI.',
      path: '/services'
    });
  }

  return createPageMetadata({
    title: item.name,
    description: item.description,
    path: `/services/${item.slug}`
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

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={item.eyebrow}
          title={item.name}
          description={item.heroText}
          breadcrumbs={[
            { label: 'Главная', href: '/' },
            { label: 'Услуги', href: '/services' },
            { label: item.name }
          ]}
          actions={
            <>
              <ButtonLink href="/contacts#booking">Записаться</ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                Все категории
              </ButtonLink>
            </>
          }
          details={[
            `${item.services.length} услуг в категории.`,
            'Выберите процедуру по задаче, времени и формату визита.'
          ]}
        />

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="surface-card p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Что важно</p>
            <h2 className="mt-4 font-serif text-4xl text-[color:var(--ink)]">Услуги собраны по реальным задачам и комфорту.</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              Внутри категории легко сравнить процедуры, выбрать подходящий формат визита и перейти к записи без лишних шагов.
            </p>
          </article>

          <div className="grid gap-4 sm:grid-cols-2">
            {item.services.slice(0, 4).map((service) => (
              <div key={service.id} className="surface-card p-5">
                <h3 className="font-serif text-3xl text-[color:var(--ink)]">{service.displayName}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{service.teaser}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Услуги категории"
            title="Выберите конкретную процедуру."
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
            <ButtonLink href="/contacts#booking">Записаться</ButtonLink>
            <ButtonLink href="/prices" variant="secondary">
              Смотреть цены
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
