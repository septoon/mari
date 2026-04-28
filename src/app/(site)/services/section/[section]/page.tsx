import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CategoryCard } from '@/components/cards/category-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export async function generateStaticParams() {
  const catalog = await getLiveCatalog();
  return catalog.serviceSections.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const catalog = await getLiveCatalog();
  if (!isSiteBlockVisible(catalog.bootstrap.config.extra, SITE_BLOCK_KEYS.page('services'))) {
    notFound();
  }
  const item = catalog.serviceSections.find((entry) => entry.slug === section);

  if (!item) {
    return createPageMetadata({
      title: 'Раздел услуг',
      description: 'Раздел услуг МАРИ.',
      path: '/services',
    });
  }

  return createPageMetadata({
    title: item.name,
    description: `Категории раздела «${item.name}».`,
    path: `/services/section/${item.slug}`,
  });
}

export default async function ServiceSectionPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const catalog = await getLiveCatalog();
  const item = catalog.serviceSections.find((entry) => entry.slug === section);

  if (!item) {
    notFound();
  }

  const hero = resolveSitePageHero('services', catalog.bootstrap.config.extra);
  const showHero = isSiteBlockVisible(catalog.bootstrap.config.extra, SITE_BLOCK_KEYS.pageHero('services'));

  return (
    <main className="pb-14">
      <Container>
        {showHero ? (
          <PageHero
            eyebrow="Раздел услуг"
            title={item.name}
            description={`Выберите категорию внутри раздела. Здесь ${item.categories.length} категорий и ${item.servicesCount} услуг.`}
            imageUrl={item.imageUrl || hero.imageUrl}
            imageAlt={item.name}
            breadcrumbs={[
              { label: 'Главная', href: '/' },
              { label: 'Услуги', href: '/services' },
              { label: item.name },
            ]}
            actions={
              <>
                <ButtonLink href="/services">Все разделы</ButtonLink>
                <ButtonLink href="/booking" variant="secondary">
                  Записаться
                </ButtonLink>
              </>
            }
            details={[
              `${item.categories.length} категорий в разделе.`,
              'Следующий шаг после раздела: страница категории с конкретными услугами.',
            ]}
          />
        ) : null}

        <SectionHeading
          eyebrow="Категории раздела"
          title="Выберите нужную категорию."
          description="После категории откроется страница со списком услуг этого направления."
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {item.categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              serviceCount={category.services.length}
            />
          ))}
        </div>
      </Container>

      <CtaPanel
        eyebrow="Дальше по каталогу"
        title="После выбора категории останется открыть нужную услугу."
        description="Навигация теперь идет по цепочке: раздел, категория, услуга."
        actions={
          <>
            <ButtonLink href="/services">К разделам</ButtonLink>
            <ButtonLink href="/prices" variant="secondary">
              Смотреть цены
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
