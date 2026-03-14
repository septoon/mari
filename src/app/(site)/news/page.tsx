import { ArticleCard } from '@/components/cards/article-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getNews } from '@/content/queries';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Новости',
  description: 'Новости Mari: новые пространства, услуги и сервисные обновления.',
  path: '/news'
});

export default function NewsPage() {
  const articles = getNews();

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow="Новости"
          title="Новости салона, сезонные предложения и важные обновления."
          description="Здесь рассказываем о новых процедурах, пространствах, форматах ухода и приятных изменениях в MARI."
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
