import Link from 'next/link';
import { ArrowRight, ImageIcon } from 'lucide-react';

import type { OfferItem } from '@/content/types';

import { Badge } from '@/components/ui/badge';

export function OfferCard({ offer }: { offer: OfferItem }) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <div className="mb-5 aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-(--line)">
        {offer.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={offer.imageUrl} alt={offer.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(145deg,rgba(247,241,234,0.9),rgba(255,255,255,0.98))] text-(--muted)">
            <div className="text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-(--accent-strong)" />
              <p className="mt-3 text-sm font-medium">Место под фото предложения</p>
            </div>
          </div>
        )}
      </div>
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
