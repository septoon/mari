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
    <Link href={href} className="flex flex-col gap-4 border-b border-(--line) py-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="text-base font-medium text-(--foreground)">{name}</h3>
      </div>
      <div className="flex items-center justify-between gap-6 sm:justify-end">
        <p className="text-sm text-(--muted-strong)">{durationMinutes} мин</p>
        <p className="text-base font-medium text-(--foreground)">от {formatCurrency(priceFrom)}</p>
      </div>
    </Link>
  );
}
