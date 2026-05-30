import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ImageIcon } from 'lucide-react';

import type { NewsArticle } from '@/content/types';

export function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-(--line)">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            sizes="(max-width: 767px) calc(100vw - 5rem), (max-width: 1279px) 50vw, 33vw"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,rgba(247,241,234,0.9),rgba(255,255,255,0.98))] text-(--muted)">
            <div className="text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-(--accent-strong)" />
              <p className="mt-3 text-sm font-medium">Место под фото новости</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">
        {article.category} · {new Date(article.publishedAt).toLocaleDateString('ru-RU')}
      </p>
      <h3 className="mt-4 font-serif text-3xl text-(--ink)">{article.title}</h3>
      <p className="mt-4 text-sm leading-7 text-(--muted)">{article.excerpt}</p>
      <Link
        href={`/news/${article.slug}`}
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-(--foreground) transition hover:text-(--accent-strong)"
      >
        Читать материал
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
