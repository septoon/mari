import type { ReactNode } from 'react';

import { cn } from '@/lib/classnames';

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = 'left'
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'mx-auto max-w-3xl text-center md:flex-col md:items-center'
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <h2 className="section-title">{title}</h2>
        {description ? <p className="section-copy">{description}</p> : null}
      </div>
      {action ? <div className={cn(align === 'center' && 'mx-auto')}>{action}</div> : null}
    </div>
  );
}
