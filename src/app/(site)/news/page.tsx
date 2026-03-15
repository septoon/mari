import { ArticleCard } from '@/components/cards/article-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getClientBootstrap } from '@/lib/api/backend';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { getSiteNews } from '@/lib/site-content';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Новости',
  description: 'Новости Mari: новые пространства, услуги и сервисные обновления.',
  path: '/news'
});

export default async function NewsPage() {
  const [articles, bootstrap] = await Promise.all([getSiteNews(), getClientBootstrap()]);
  const hero = resolveSitePageHero('news', bootstrap.config.extra);

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Новости' }]}
          actions={<ButtonLink href="/booking">Записаться</ButtonLink>}
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      </Container>

      <CtaPanel
        eyebrow="Читать дальше"
        title="После новостей можно сразу перейти к услугам или записи."
        description="Если вас заинтересовала процедура или формат визита, выберите услугу и удобное время."
        actions={
          <>
            <ButtonLink href="/about">О бренде</ButtonLink>
            <ButtonLink href="/booking" variant="secondary">
              Записаться
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
