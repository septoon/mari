import { CategoryCard } from '@/components/cards/category-card';
import { ServiceCard } from '@/components/cards/service-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { ServiceCategoryNav } from '@/components/site/service-category-nav';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { resolveSitePageHero } from '@/lib/site-page-heroes';

export const metadata = createPageMetadata({
  title: 'Услуги',
  description:
    'Каталог услуг MARI: процедуры, цены, длительность и переход к записи.',
  path: '/services'
});

export default async function ServicesPage() {
  const catalog = await getLiveCatalog();
  const hero = resolveSitePageHero('services', catalog.bootstrap.config.extra);

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Услуги' }]}
          actions={<ButtonLink href="/booking">Записаться</ButtonLink>}
          details={[
            `${catalog.serviceCategories.length} категорий и ${catalog.services.length} активных услуг.`,
            'Из карточки услуги можно сразу перейти к подробностям и записи.'
          ]}
        />

        <SectionHeading
          eyebrow="Навигация по категориям"
          title="Сначала выберите нужное направление."
          description="Так проще быстро перейти к тем услугам, которые подходят именно вам."
        />
        <div className="mt-6">
          <ServiceCategoryNav categories={catalog.serviceCategories} />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {catalog.serviceCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              serviceCount={category.services.length}
            />
          ))}
        </div>

        <div className="mt-16 space-y-16">
          {catalog.serviceCategories.map((category) => (
            <section key={category.id} id={category.slug} className="scroll-mt-28">
              <SectionHeading
                eyebrow={category.eyebrow}
                title={category.name}
                description={category.heroText}
                action={
                  <ButtonLink href={`/services/${category.slug}`} variant="secondary">
                    Открыть категорию
                  </ButtonLink>
                }
              />
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                {category.services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    href={`/services/${service.categorySlug}/${service.slug}`}
                    categoryName={category.name}
                    name={service.displayName}
                    excerpt={service.teaser}
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
        eyebrow="Запись"
        title="Осталось выбрать услугу и удобное время."
        description="Можно перейти в карточку процедуры, сравнить варианты или сразу открыть запись."
        actions={
          <>
            <ButtonLink href="/booking">Записаться</ButtonLink>
            <ButtonLink href="/masters" variant="secondary">
              Выбрать мастера
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
