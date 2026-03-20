import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { OfferItem } from '@/content/types';

import { Badge } from '@/components/ui/badge';

export function OfferCard({ offer }: { offer: OfferItem }) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <Badge className="w-fit">{offer.badge}</Badge>
      <h3 className="mt-5 font-serif text-3xl text-(--ink)">{offer.title}</h3>
      <p className="mt-3 text-sm font-medium text-(--foreground)">{offer.subtitle}</p>
      <p className="mt-3 text-sm leading-7 text-(--muted)">{offer.description}</p>
      <p className="mt-6 text-sm text-(--muted-strong)">{offer.priceNote}</p>
      <Link
        href={offer.ctaHref}
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-(--foreground) transition hover:text-(--accent-strong)"
      >
        Открыть предложение
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
