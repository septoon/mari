import { CtaPanel } from '@/components/site/cta-panel';
import { MastersBrowser } from '@/components/site/masters-browser';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';
import {
  applySpecialistsPageTemplate,
  getSpecialistsPageContent,
} from '@/lib/specialists-page-content';

export const metadata = createPageMetadata({
  title: 'Специалисты',
  description: 'Специалисты МАРИ: направления работы и запись на услуги.',
  path: '/masters',
});

export default async function MastersPage() {
  const [catalog, pageContent] = await Promise.all([getLiveCatalog(), getSpecialistsPageContent()]);
  const extra = catalog.bootstrap.config.extra;
  const hero = resolveSitePageHero('masters', catalog.bootstrap.config.extra);
  const showHero = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.pageHero('masters'));
  const showCta = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.specialistsPage.listCta);

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
            breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Специалисты' }]}
            actions={
              <ButtonLink href="/booking">{pageContent.listPage.heroPrimaryCtaLabel}</ButtonLink>
            }
            details={[
              applySpecialistsPageTemplate(pageContent.listPage.detailsCountTemplate, {
                count: catalog.specialists.length,
              }),
              pageContent.listPage.detailsFilterText,
            ]}
          />
        ) : null}

        <MastersBrowser masters={catalog.specialists} />
      </Container>

      {showCta ? (
        <CtaPanel
          eyebrow={pageContent.listPage.ctaEyebrow}
          title={pageContent.listPage.ctaTitle}
          description={pageContent.listPage.ctaDescription}
          actions={
            <>
              <ButtonLink href="/booking">{pageContent.listPage.ctaPrimaryLabel}</ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                {pageContent.listPage.ctaSecondaryLabel}
              </ButtonLink>
            </>
          }
        />
      ) : null}
    </main>
  );
}
