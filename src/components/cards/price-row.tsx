import Link from 'next/link';

import { formatCurrency } from '@/lib/format';

export function PriceRow({
  href,
  name,
  tagline,
  durationMinutes,
  priceFrom,
}: {
  href: string;
  name: string;
  tagline: string;
  durationMinutes: number;
  priceFrom: number;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-[color:var(--line)] py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-base font-medium text-[color:var(--foreground)]">{name}</h3>
        <p className="mt-1 text-sm text-[color:var(--muted)]">{tagline}</p>
      </div>
      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <p className="text-sm text-[color:var(--muted-strong)]">{durationMinutes} мин</p>
        <p className="text-base font-medium text-[color:var(--foreground)]">от {formatCurrency(priceFrom)}</p>
        <Link href={href} className="text-sm text-[color:var(--accent-strong)] transition hover:text-[color:var(--ink)]">
          Открыть
        </Link>
      </div>
    </div>
  );
}
