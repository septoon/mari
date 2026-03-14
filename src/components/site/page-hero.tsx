import type { ReactNode } from 'react';

import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Badge } from '@/components/ui/badge';
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
  className,
  titleClassName
}: {
  eyebrow?: string;
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  details?: string[];
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
          <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--muted)]">{description}</p>
          {actions ? <div className="mt-8 flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {details?.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail} className="surface-card p-5 text-sm leading-7 text-[color:var(--muted)]">
                <Badge className="mb-4">Mari detail</Badge>
                {detail}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
