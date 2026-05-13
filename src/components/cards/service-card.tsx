import Link from 'next/link';
import { ArrowRight, Clock3, ImageIcon } from 'lucide-react';

import { formatCurrency } from '@/lib/format';

export function ServiceCard({
  href,
  categoryName,
  name,
  excerpt,
  durationMinutes,
  priceFrom,
  imageUrl,
}: {
  href: string;
  categoryName: string;
  name: string;
  excerpt: string;
  durationMinutes: number;
  priceFrom: number;
  imageUrl?: string | null;
}) {
  return (
    <article className="surface-card flex h-full flex-col p-3 sm:p-4">
      <div className="mb-4 aspect-[4/5] overflow-hidden rounded-[1.1rem] border border-(--line)">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${name} — ${categoryName} в салоне красоты МАРИ`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,rgba(247,241,234,0.9),rgba(255,255,255,0.98))] text-(--muted)">
            <ImageIcon className="h-6 w-6 text-(--accent-strong)" />
            <p className="px-2 text-center text-xs font-medium">Место под фото услуги</p>
          </div>
        )}
      </div>
      <p className="text-[0.62rem] uppercase tracking-[0.22em] text-(--muted-strong)">{categoryName}</p>
      <h3 className="mt-2 break-words font-serif text-xl leading-tight text-(--ink) sm:text-2xl">{name}</h3>
      <p className="mt-3 text-xs leading-5 text-(--muted)">{excerpt}</p>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-(--muted-strong)">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-(--line) px-2 py-1">
          <Clock3 className="h-3.5 w-3.5" />
          {durationMinutes} мин
        </span>
        <span className="rounded-full border border-(--line) px-2 py-1">
          от {formatCurrency(priceFrom)}
        </span>
      </div>

      <Link
        href={href}
        className="mt-auto inline-flex pt-5 items-center gap-2 text-xs font-medium text-(--foreground) transition hover:text-(--accent-strong)"
      >
        Открыть услугу
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
