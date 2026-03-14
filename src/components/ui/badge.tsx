import type { ReactNode } from 'react';

import { cn } from '@/lib/classnames';

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[color:var(--line)] bg-white/72 px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--muted-strong)]',
        className
      )}
    >
      {children}
    </span>
  );
}
