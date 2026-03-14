import { PriceRow } from '@/components/cards/price-row';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';

export const metadata = createPageMetadata({
  title: 'Цены',
  description: 'Цены на услуги MARI: процедуры, длительность и переход к записи.',
  path: '/prices'
});

export default async function PricesPage() {
  const catalog = await getLiveCatalog();

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow="Цены"
          title="Цены без сложных условий."
          description="Смотрите услуги, длительность и ориентир по стоимости, чтобы сразу спланировать визит."
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Цены' }]}
          actions={<ButtonLink href="/booking">Записаться</ButtonLink>}
          details={[
            `${catalog.services.length} услуг в прайсе.`,
            'Из прайса можно сразу перейти в карточку процедуры.'
          ]}
        />

        <div className="space-y-14">
          {catalog.serviceCategories.map((category) => (
            <section key={category.id}>
              <SectionHeading
                eyebrow={category.eyebrow}
                title={category.name}
                description={category.description}
              />
              <div className="mt-6 rounded-[1.75rem] border border-[color:var(--line)] bg-white/78 px-6">
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
