import { notFound } from 'next/navigation';

import { PriceRow } from '@/components/cards/price-row';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { getPricesPageContent } from '@/lib/prices-page-content';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export async function generateMetadata() {
  const pageContent = await getPricesPageContent();
  return createPageMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    path: '/prices',
  });
}

export default async function PricesPage() {
  const catalog = await getLiveCatalog();
  const pageContent = await getPricesPageContent();
  const extra = catalog.bootstrap.config.extra;
  const hero = resolveSitePageHero('prices', extra);
  const showPage = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.page('prices'));
  const showHero = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.pageHero('prices'));
  const showCatalog = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.pricesPage.catalog);
  const showBottomCta = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.pricesPage.bottomCta);

  if (!showPage) {
    notFound();
  }

  return (
    <main className="pb-14">
      <Container>
        {showHero ? (
          <PageHero
            eyebrow={hero.eyebrow}
            title={hero.title}
            description={hero.description}
            imageUrl={hero.imageUrl}
            imageAlt={hero.title}
            mobileActionsPlacement="after-image"
            breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Цены' }]}
            actions={<ButtonLink href="/booking">{pageContent.heroActions.primaryLabel}</ButtonLink>}
          />
        ) : null}

        {showCatalog ? (
          <>
            <SectionHeading
              eyebrow={pageContent.catalog.eyebrow}
              title={pageContent.catalog.title}
              description={pageContent.catalog.description}
            />

            {catalog.serviceCategories.length ? (
              <div className="mt-10 space-y-14">
                {catalog.serviceCategories.map((category) => (
                  <section key={category.id}>
                    <SectionHeading
                      eyebrow={category.eyebrow}
                      title={category.name}
                      description={category.description}
                    />
                    <div className="mt-6 rounded-[1.75rem] border border-(--line) bg-white/78 px-6">
                      {category.services.map((service) => (
                        <PriceRow
                          key={service.id}
                          href={`/services/${service.categorySlug}/${service.slug}`}
                          name={service.displayName}
                          tagline={service.teaser}
                          durationMinutes={Math.round(service.durationSec / 60)}
                          priceFrom={service.priceMin}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="mt-10 rounded-[1.75rem] border border-(--line) bg-white/78 p-8">
                <h2 className="text-2xl font-semibold text-(--ink)">{pageContent.catalog.emptyTitle}</h2>
                <p className="mt-3 max-w-2xl text-base leading-7 text-(--muted)">
                  {pageContent.catalog.emptyDescription}
                </p>
              </div>
            )}
          </>
        ) : null}
      </Container>

      {showBottomCta ? (
        <CtaPanel
          eyebrow={pageContent.bottomCta.eyebrow}
          title={pageContent.bottomCta.title}
          description={pageContent.bottomCta.description}
          actions={
            <>
              <ButtonLink href="/services">{pageContent.bottomCta.primaryCtaLabel}</ButtonLink>
              <ButtonLink href="/booking" variant="secondary">
                {pageContent.bottomCta.secondaryCtaLabel}
              </ButtonLink>
            </>
          }
        />
      ) : null}
    </main>
  );
}
