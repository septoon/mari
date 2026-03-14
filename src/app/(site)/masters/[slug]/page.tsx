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
  return catalog.specialists.map((master) => ({ slug: master.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await getLiveCatalog();
  const master = catalog.specialists.find((item) => item.slug === slug);

  if (!master) {
    return createPageMetadata({
      title: 'Специалист',
      description: 'Профиль специалиста MARI.',
      path: '/masters'
    });
  }

  return createPageMetadata({
    title: master.name,
    description: master.summary,
    path: `/masters/${master.slug}`
  });
}

export default async function MasterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getLiveCatalog();
  const master = catalog.specialists.find((item) => item.slug === slug);

  if (!master) {
    notFound();
  }

  const services = catalog.services.filter((service) => master.serviceIds.includes(service.id));

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={master.specialtyLabel}
          title={master.name}
          description={master.summary}
          breadcrumbs={[
            { label: 'Главная', href: '/' },
            { label: 'Специалисты', href: '/masters' },
            { label: master.name }
          ]}
          actions={
            <>
              <ButtonLink href={`/booking?master=${master.slug}`}>
                Записаться к специалисту
              </ButtonLink>
              <ButtonLink href="/masters" variant="secondary">
                Все специалисты
              </ButtonLink>
            </>
          }
          details={[
            `${services.length} услуг доступно для онлайн-записи.`,
            `Направления: ${master.categoryNames.slice(0, 3).join(', ')}.`
          ]}
        />

        <section className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
          <article className="surface-card p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">О специалисте</p>
            <div className="mt-5 space-y-4 text-sm text-[color:var(--muted)]">
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4">
                <p className="font-medium text-[color:var(--foreground)]">Специализация</p>
                <p className="mt-2">{master.specialtyLabel}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4">
                <p className="font-medium text-[color:var(--foreground)]">Категории услуг</p>
                <p className="mt-2">{master.categoryNames.join(', ')}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4">
                <p className="font-medium text-[color:var(--foreground)]">Последнее обновление</p>
                <p className="mt-2">{new Date(master.updatedAt).toLocaleDateString('ru-RU')}</p>
              </div>
            </div>
          </article>

          <article className="surface-card p-6">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Подход</p>
            <h2 className="mt-4 font-serif text-4xl text-[color:var(--ink)]">Выбирайте специалиста по направлению и стилю работы.</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              На странице собраны ключевые направления специалиста и список услуг, чтобы вы могли быстро понять, подходит ли вам этот специалист.
            </p>
          </article>
        </section>

        <section className="mt-16">
          <SectionHeading
            eyebrow="Услуги специалиста"
            title="Услуги, на которые можно записаться к этому специалисту."
            description="Сравните процедуры по времени и стоимости и выберите ту, которая подходит именно вам."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                href={`/services/${service.categorySlug}/${service.slug}`}
                categoryName={service.category.name}
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
        eyebrow="Запись к специалисту"
        title="Если специалист подходит вам по направлению, переходите к записи."
        description="Осталось выбрать услугу и удобное время визита."
        actions={
          <>
            <ButtonLink href={`/booking?master=${master.slug}`}>
              Записаться к специалисту
            </ButtonLink>
            <ButtonLink href="/contacts" variant="secondary">
              Контакты салона
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
