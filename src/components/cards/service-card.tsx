import Link from 'next/link';
import { ArrowRight, Clock3 } from 'lucide-react';

import { formatCurrency } from '@/lib/format';

export function ServiceCard({
  href,
  categoryName,
  name,
  excerpt,
  durationMinutes,
  priceFrom,
}: {
  href: string;
  categoryName: string;
  name: string;
  excerpt: string;
  durationMinutes: number;
  priceFrom: number;
}) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">{categoryName}</p>
      <h3 className="mt-4 font-serif text-3xl text-[color:var(--ink)]">{name}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{excerpt}</p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm text-[color:var(--muted-strong)]">
        <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-3 py-1.5">
          <Clock3 className="h-4 w-4" />
          {durationMinutes} мин
        </span>
        <span className="rounded-full border border-[color:var(--line)] px-3 py-1.5">
          от {formatCurrency(priceFrom)}
        </span>
      </div>

      <Link
        href={href}
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--accent-strong)]"
      >
        Открыть услугу
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
