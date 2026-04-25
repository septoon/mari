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
  meta,
  imageUrl,
  imageAlt,
  className,
  titleClassName,
  metaPlacement = 'inline',
  actionsPlacement = 'inline',
  imageClassName,
  metaClassName,
  actionsClassName,
  mobileActionsPlacement = 'inline',
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  details?: string[];
  meta?: ReactNode;
  imageUrl?: string | null;
  imageAlt?: string;
  className?: string;
  titleClassName?: string;
  metaPlacement?: 'inline' | 'separate';
  actionsPlacement?: 'inline' | 'separate';
  imageClassName?: string;
  metaClassName?: string;
  actionsClassName?: string;
  mobileActionsPlacement?: 'inline' | 'after-image';
}) {
  return (
    <section className={cn('pb-10 pt-8 md:pb-14 md:pt-12', className)}>
      {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} className="mb-6" /> : null}
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="order-1 max-w-3xl">
          {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
          <h1 className={cn('headline-xl', titleClassName)}>{title}</h1>
          {meta ? (
            metaPlacement === 'inline' ? <div className="mt-6">{meta}</div> : null
          ) : (
            <>
              {description ? (
                <p className="mt-6 max-w-2xl text-base leading-8 text-(--muted)">{description}</p>
              ) : null}
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
            </>
          )}
          {actions && actionsPlacement === 'inline' ? (
            <div
              className={cn(
                'mt-8 flex flex-wrap gap-3',
                mobileActionsPlacement === 'after-image' && 'hidden lg:flex',
              )}
            >
              {actions}
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            'relative order-2 aspect-[4/5] min-h-72 overflow-hidden rounded-[2rem] border border-(--line) bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,241,234,0.88)_52%,rgba(232,224,215,0.8)_100%)] shadow-[0_30px_90px_rgba(69,48,29,0.08)] lg:order-none',
            imageClassName
          )}
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={imageAlt || title}
              className="h-full min-h-72 w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-72 flex-col items-center justify-center gap-4 px-8 text-center text-(--muted)">
              <ImageIcon className="h-10 w-10 text-(--accent-strong)" />
              <p className="font-serif text-3xl text-(--ink)">Место под фото</p>
            </div>
          )}
        </div>

        {actions && actionsPlacement === 'inline' && mobileActionsPlacement === 'after-image' ? (
          <div className="order-3 flex flex-wrap gap-3 lg:hidden">{actions}</div>
        ) : null}

        {meta && metaPlacement === 'separate' ? (
          <div className={cn('order-2 lg:order-none', metaClassName)}>{meta}</div>
        ) : null}

        {actions && actionsPlacement === 'separate' ? (
          <div className={cn('order-3 flex flex-wrap gap-3 lg:order-none', actionsClassName)}>
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
