import { PriceRow } from '@/components/cards/price-row';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export const metadata = createPageMetadata({
  title: 'Цены',
  description: 'Цены на услуги МАРИ: процедуры, длительность и переход к записи.',
  path: '/prices',
});

export default async function PricesPage() {
  const catalog = await getLiveCatalog();
  const hero = resolveSitePageHero('prices', catalog.bootstrap.config.extra);
  const showHero = isSiteBlockVisible(catalog.bootstrap.config.extra, SITE_BLOCK_KEYS.pageHero('prices'));

  return (
    <main className="pb-14">
      <Container>
        {showHero ? (
          <PageHero
            eyebrow={hero.eyebrow}
            title={hero.title}
            description={null}
            imageUrl={hero.imageUrl}
            imageAlt={hero.title}
            mobileActionsPlacement="after-image"
            breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Цены' }]}
            actions={<ButtonLink href="/booking">Записаться</ButtonLink>}
          />
        ) : null}

        <div className="space-y-14">
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
      </Container>

      <CtaPanel
        eyebrow="После прайса"
        title="После прайса остаётся выбрать процедуру и удобное время."
        description="Перейдите в карточку услуги или сразу откройте запись."
        actions={
          <>
            <ButtonLink href="/services">Каталог услуг</ButtonLink>
            <ButtonLink href="/booking" variant="secondary">
              Записаться
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
