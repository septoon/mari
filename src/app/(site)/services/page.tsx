import { notFound } from 'next/navigation';

import { CategoryCard } from '@/components/cards/category-card';
import { ServiceSectionCard } from '@/components/cards/service-section-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';
import { applyServicesPageTemplate, getServicesPageContent } from '@/lib/services-page-content';

export async function generateMetadata() {
  const pageContent = await getServicesPageContent();
  return createPageMetadata({
    title: pageContent.seo.title,
    description: pageContent.seo.description,
    path: '/services',
  });
}

export default async function ServicesPage() {
  const catalog = await getLiveCatalog();
  const pageContent = await getServicesPageContent();
  const extra = catalog.bootstrap.config.extra;
  if (!isSiteBlockVisible(extra, SITE_BLOCK_KEYS.page('services'))) {
    notFound();
  }
  const hero = resolveSitePageHero('services', extra);
  const showHero = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.pageHero('services'));
  const showCatalog = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.servicesPage.catalog);
  const showBottomCta = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.servicesPage.bottomCta);
  const standaloneCategories = catalog.serviceCategories.filter((category) => !category.sectionId);

  return (
    <main className="pb-14">
      <Container>
        {showHero ? (
          <PageHero
            eyebrow={hero.eyebrow}
            title={hero.title}
            description={hero.description}
            imageUrl={hero.imageUrl}
            imageAlt="Услуги МАРИ"
            mobileActionsPlacement="after-image"
            breadcrumbs={[
              { label: 'Главная', href: '/' },
              { label: 'Услуги' },
            ]}
            actions={
              <>
                <ButtonLink href="/booking">{pageContent.heroActions.primaryLabel}</ButtonLink>
                <ButtonLink href="/prices" variant="secondary">
                  {pageContent.heroActions.secondaryLabel}
                </ButtonLink>
              </>
            }
          />
        ) : null}

        {showCatalog ? (
          <>
            <SectionHeading
              eyebrow={pageContent.catalog.eyebrow}
              title={pageContent.catalog.title}
              description={pageContent.catalog.description}
            />

            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
              {catalog.serviceSections.map((section) => (
                <ServiceSectionCard
                  key={section.id}
                  section={section}
                  labels={{
                    eyebrow: pageContent.catalog.sectionCardEyebrow,
                    fallbackText: pageContent.catalog.sectionCardFallbackText,
                    serviceCountLabel: applyServicesPageTemplate(
                      pageContent.catalog.sectionCardServiceCountTemplate,
                      { count: section.servicesCount },
                    ),
                    actionLabel: pageContent.catalog.sectionCardActionLabel,
                  }}
                />
              ))}
              {standaloneCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  serviceCount={category.services.length}
                  labels={{
                    fallbackText: pageContent.catalog.categoryFallbackText,
                    serviceCountLabel: applyServicesPageTemplate(
                      pageContent.catalog.categoryServiceCountTemplate,
                      { count: category.services.length },
                    ),
                    actionLabel: pageContent.catalog.categoryActionLabel,
                  }}
                />
              ))}
            </div>
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
              <ButtonLink href="/booking">{pageContent.bottomCta.primaryCtaLabel}</ButtonLink>
              <ButtonLink href="/masters" variant="secondary">
                {pageContent.bottomCta.secondaryCtaLabel}
              </ButtonLink>
            </>
          }
        />
      ) : null}
    </main>
  );
}
