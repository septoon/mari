import { CategoryCard } from '@/components/cards/category-card';
import { ServiceSectionCard } from '@/components/cards/service-section-card';
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
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export const metadata = createPageMetadata({
  title: 'Услуги',
  description: 'Каталог услуг МАРИ: процедуры, цены, длительность и переход к записи.',
  path: '/services',
});

export default async function ServicesPage() {
  const catalog = await getLiveCatalog();
  const hero = resolveSitePageHero('services', catalog.bootstrap.config.extra);
  const showHero = isSiteBlockVisible(catalog.bootstrap.config.extra, SITE_BLOCK_KEYS.pageHero('services'));
  const standaloneCategories = catalog.serviceCategories.filter((category) => !category.sectionId);
  const navItems = [
    ...catalog.serviceSections.map((section) => ({ slug: section.slug, name: section.name })),
    ...standaloneCategories.map((category) => ({ slug: category.slug, name: category.name })),
  ];

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
            breadcrumbs={[
              { label: 'Главная', href: '/' },
              { label: 'Услуги' },
            ]}
            actions={
              <>
                <ButtonLink href="/booking">Записаться</ButtonLink>
                <ButtonLink href="/prices" variant="secondary">
                  Смотреть цены
                </ButtonLink>
              </>
            }
            details={[
              `${catalog.serviceSections.length} разделов с группировкой по направлениям.`,
              `${standaloneCategories.length} отдельных категорий вне разделов.`,
            ]}
          />
        ) : null}

        <SectionHeading
          eyebrow="Навигация по категориям"
          title="Сначала выберите раздел или нужную категорию."
          description="Собрали услуги по крупным направлениям, а категории без раздела оставили отдельными блоками."
        />
        <div className="mt-6">
          <ServiceCategoryNav categories={navItems} />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {catalog.serviceSections.map((section) => (
            <ServiceSectionCard key={section.id} section={section} />
          ))}
          {standaloneCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              serviceCount={category.services.length}
            />
          ))}
        </div>

        <div className="mt-16 space-y-16">
          {catalog.serviceSections.map((section) => (
            <section key={section.id} id={section.slug} className="scroll-mt-28">
              <SectionHeading
                eyebrow="Раздел услуг"
                title={section.name}
                description={`В разделе ${section.categories
                  .map((category) => category.name)
                  .join(', ')
                  .toLowerCase()}.`}
              />
              <div className="mt-8 space-y-12">
                {section.categories.map((category) => (
                  <section key={category.id} className="space-y-6">
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
                    <div className="grid gap-6 md:grid-cols-2">
                      {category.services.map((service) => (
                        <ServiceCard
                          key={service.id}
                          href={`/services/${service.categorySlug}/${service.slug}`}
                          categoryName={category.name}
                          name={service.displayName}
                          excerpt={service.teaser}
                          durationMinutes={Math.round(service.durationSec / 60)}
                          priceFrom={service.priceMin}
                          imageUrl={service.imageUrl || category.imageUrl || section.imageUrl || null}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </section>
          ))}

          {standaloneCategories.map((category) => (
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
                    imageUrl={service.imageUrl || category.imageUrl || null}
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
