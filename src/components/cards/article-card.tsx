import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { NewsArticle } from '@/content/types';

export function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">
        {article.category} · {new Date(article.publishedAt).toLocaleDateString('ru-RU')}
      </p>
      <h3 className="mt-4 font-serif text-3xl text-[color:var(--ink)]">{article.title}</h3>
      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{article.excerpt}</p>
      <Link
        href={`/news/${article.slug}`}
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--accent-strong)]"
      >
        Читать материал
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
