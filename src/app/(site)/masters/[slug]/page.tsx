import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ImageIcon } from 'lucide-react';

import { ServiceCard } from '@/components/cards/service-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { SpecialistRatingPanel } from '@/components/site/specialist-rating-panel';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';
import {
  getSpecialistsPageContent,
} from '@/lib/specialists-page-content';

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
      description: 'Профиль специалиста МАРИ.',
      path: '/masters',
    });
  }

  return createPageMetadata({
    title: master.name,
    description: master.summary,
    path: `/masters/${master.slug}`,
  });
}

export default async function MasterDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [catalog, pageContent] = await Promise.all([getLiveCatalog(), getSpecialistsPageContent()]);
  const master = catalog.specialists.find((item) => item.slug === slug);

  if (!master) {
    notFound();
  }

  const services = catalog.services.filter((service) => master.serviceIds.includes(service.id));
  const extra = catalog.bootstrap.config.extra;
  const hero = resolveSitePageHero('masterDetails', catalog.bootstrap.config.extra, {
    masterSpecialty: master.specialtyLabel,
    masterName: master.name,
    masterSummary: master.summary,
    masterCategories: master.categoryNames.join(', '),
  });
  const showHero = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.pageHero('masterDetails'));
  const showAbout = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.specialistsPage.detailAbout);
  const showApproach = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.specialistsPage.detailApproach);
  const showServices = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.specialistsPage.detailServices);
  const showCta = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.specialistsPage.detailCta);

  return (
    <main className="pb-14">
      <Container>
        {showHero ? (
          <section className="pb-10 pt-8 md:pb-14 md:pt-12">
            <Breadcrumbs
              items={[
                { label: 'Главная', href: '/' },
                { label: 'Специалисты', href: '/masters' },
                { label: master.name },
              ]}
              className="mb-6"
            />

            <div className="max-w-4xl md:hidden">
             {hero.eyebrow ? <p className="section-kicker">{hero.eyebrow}</p> : null}
              <h1 className="headline-xl">{hero.title}</h1>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-start">
              <div className="relative overflow-hidden rounded-[2rem] border border-(--line) bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,241,234,0.88)_52%,rgba(232,224,215,0.8)_100%)] shadow-[0_30px_90px_rgba(69,48,29,0.08)]">
                {master.photo?.preferredUrl || hero.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={master.photo?.preferredUrl || hero.imageUrl || undefined}
                    alt={master.name}
                    className="h-full min-h-72 w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-72 flex-col items-center justify-center gap-4 px-8 text-center text-(--muted)">
                    <ImageIcon className="h-10 w-10 text-(--accent-strong)" />
                    <p className="font-serif text-3xl text-(--ink)">Место под фото</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 lg:gap-5">
                <div className="hidden md:block">
                  {hero.eyebrow ? <p className="section-kicker">{hero.eyebrow}</p> : null}
                  <h1 className="headline-xl">{hero.title}</h1>
                </div>
                <SpecialistRatingPanel specialist={master} />
                <ButtonLink href={`/booking?master=${master.slug}`} className="w-full sm:w-auto lg:w-fit">
                  {pageContent.detailPage.heroPrimaryCtaLabel}
                </ButtonLink>
              </div>
            </div>
          </section>
        ) : null}

        {showAbout || showApproach ? (
          <section className={`grid gap-6 ${showAbout && showApproach ? 'lg:grid-cols-[0.88fr_1.12fr]' : ''}`}>
            {showAbout ? (
              <article className="surface-card p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">
                  {pageContent.detailPage.aboutEyebrow}
                </p>
                <div className="mt-5 space-y-4 text-sm text-(--muted)">
                  <div className="rounded-[1.5rem] border border-(--line) bg-white/72 p-4">
                    <p className="font-medium text-(--foreground)">
                      {pageContent.detailPage.aboutSpecialtyLabel}
                    </p>
                    <p className="mt-2">{master.specialtyLabel}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-(--line) bg-white/72 p-4">
                    <p className="font-medium text-(--foreground)">
                      {pageContent.detailPage.aboutCategoriesLabel}
                    </p>
                    <p className="mt-2">{master.categoryNames.join(', ')}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-(--line) bg-white/72 p-4">
                    <p className="font-medium text-(--foreground)">
                      {pageContent.detailPage.aboutUpdatedLabel}
                    </p>
                    <p className="mt-2">{new Date(master.updatedAt).toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>
              </article>
            ) : null}

            {showApproach ? (
              <article className="surface-card p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">
                  {pageContent.detailPage.approachEyebrow}
                </p>
                <h2 className="mt-4 font-serif text-4xl text-(--ink)">
                  {pageContent.detailPage.approachTitle}
                </h2>
                <p className="mt-4 text-sm leading-7 text-(--muted)">
                  {pageContent.detailPage.approachDescription}
                </p>
              </article>
            ) : null}
          </section>
        ) : null}

        {showServices ? (
          <section className="mt-16">
            <SectionHeading
              eyebrow={pageContent.detailPage.servicesEyebrow}
              title={pageContent.detailPage.servicesTitle}
              description={pageContent.detailPage.servicesDescription}
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
                  imageUrl={service.imageUrl || service.category.imageUrl || null}
                />
              ))}
            </div>
          </section>
        ) : null}
      </Container>

      {showCta ? (
        <CtaPanel
          eyebrow={pageContent.detailPage.ctaEyebrow}
          title={pageContent.detailPage.ctaTitle}
          description={pageContent.detailPage.ctaDescription}
          actions={
            <>
              <ButtonLink href={`/booking?master=${master.slug}`}>
                {pageContent.detailPage.ctaPrimaryLabel}
              </ButtonLink>
              <ButtonLink href="/contacts" variant="secondary">
                {pageContent.detailPage.ctaSecondaryLabel}
              </ButtonLink>
            </>
          }
        />
      ) : null}
    </main>
  );
}
