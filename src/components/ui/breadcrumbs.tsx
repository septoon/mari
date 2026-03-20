import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/classnames';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Хлебные крошки" className={className}>
      <ol className={cn('flex flex-wrap items-center gap-2 text-sm text-(--muted-strong)', className)}>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {index > 0 ? <ChevronRight className="h-4 w-4 opacity-45" /> : null}
            {item.href ? (
              <Link href={item.href} className="transition hover:text-(--foreground)">
                {item.label}
              </Link>
            ) : (
              <span className="text-(--foreground)">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
