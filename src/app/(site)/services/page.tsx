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
          eyebrow="Каталог услуг"
          title="Сначала выберите раздел."
          description="На первом экране показываем только разделы и категории, которые не входят ни в один раздел."
        />

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
