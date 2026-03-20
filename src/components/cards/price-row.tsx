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
    <div className="flex flex-col gap-4 border-b border-(--line) py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-base font-medium text-(--foreground)">{name}</h3>
        <p className="mt-1 text-sm text-(--muted)">{tagline}</p>
      </div>
      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <p className="text-sm text-(--muted-strong)">{durationMinutes} мин</p>
        <p className="text-base font-medium text-(--foreground)">от {formatCurrency(priceFrom)}</p>
        <Link href={href} className="text-sm text-(--accent-strong) transition hover:text-(--ink)">
          Открыть
        </Link>
      </div>
    </div>
  );
}
