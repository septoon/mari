import type { ReactNode } from 'react';
import { ImageIcon } from 'lucide-react';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { cn } from '@/lib/classnames';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  details,
  imageUrl,
  imageAlt,
  className,
  titleClassName
}: {
  eyebrow?: string;
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  details?: string[];
  imageUrl?: string | null;
  imageAlt?: string;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <section className={cn('pb-10 pt-8 md:pb-14 md:pt-12', className)}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} className="mb-6" /> : null}
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
        <div className="max-w-3xl">
          {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
          <h1 className={cn('headline-xl', titleClassName)}>{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-(--muted)">{description}</p>
          {details?.length ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {details.map((detail) => (
                <span
                  key={detail}
                  className="inline-flex items-center rounded-full border border-(--line) bg-white/78 px-4 py-2 text-sm text-(--muted-strong)"
                >
                  {detail}
                </span>
              ))}
            </div>
          ) : null}
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-(--line) bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,241,234,0.88)_52%,rgba(232,224,215,0.8)_100%)] shadow-[0_30px_90px_rgba(69,48,29,0.08)]">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={imageAlt || title}
              className="h-full min-h-72 w-full object-cover"
            />
          ) : (
            <div className="flex min-h-72 flex-col items-center justify-center gap-4 px-8 text-center text-(--muted)">
              <ImageIcon className="h-10 w-10 text-(--accent-strong)" />
              <p className="font-serif text-3xl text-(--ink)">Место под фото</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
