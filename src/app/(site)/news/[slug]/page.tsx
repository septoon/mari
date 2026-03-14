import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getNews, getNewsArticle } from '@/content/queries';
import { createPageMetadata } from '@/lib/site';

export function generateStaticParams() {
  return getNews().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getNewsArticle(slug);

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
  const article = getNewsArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={article.category}
          title={article.title}
          description={article.excerpt}
          breadcrumbs={[
            { label: 'Главная', href: '/' },
            { label: 'Новости', href: '/news' },
            { label: article.title }
          ]}
          actions={<ButtonLink href="/contacts#booking">Записаться</ButtonLink>}
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
            <ButtonLink href="/contacts#booking" variant="secondary">
              Записаться
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
