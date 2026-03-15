import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getClientBootstrap } from '@/lib/api/backend';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { getSiteNews, getSiteNewsArticle } from '@/lib/site-content';
import { createPageMetadata } from '@/lib/site';

export async function generateStaticParams() {
  return (await getSiteNews()).map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getSiteNewsArticle(slug);

  if (!article) {
    return createPageMetadata({
      title: 'Новость',
      description: 'Новость Mari.',
      path: '/news'
    });
  }

  return createPageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/news/${article.slug}`
  });
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getSiteNewsArticle(slug);

  if (!article) {
    notFound();
  }

  const bootstrap = await getClientBootstrap();
  const hero = resolveSitePageHero('newsArticle', bootstrap.config.extra, {
    newsCategory: article.category,
    newsTitle: article.title,
    newsExcerpt: article.excerpt,
    newsDate: new Date(article.publishedAt).toLocaleDateString('ru-RU')
  });

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          breadcrumbs={[
            { label: 'Главная', href: '/' },
            { label: 'Новости', href: '/news' },
            { label: article.title }
          ]}
          actions={<ButtonLink href="/booking">Записаться</ButtonLink>}
          details={[new Date(article.publishedAt).toLocaleDateString('ru-RU')]}
        />

        <article className="surface-card prose-copy max-w-4xl p-8">
          {article.body.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </article>
      </Container>

      <CtaPanel
        eyebrow="После материала"
        title="Если тема откликнулась, переходите к услугам и записи."
        description="После статьи можно посмотреть процедуры, выбрать мастера или сразу запланировать визит."
        actions={
          <>
            <ButtonLink href="/services">Смотреть услуги</ButtonLink>
            <ButtonLink href="/booking" variant="secondary">
              Записаться
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
