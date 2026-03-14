import Link from 'next/link';
import { ArrowRight, Clock3, MapPin } from 'lucide-react';

import type { LocationProfile } from '@/content/types';

export function LocationCard({ location }: { location: LocationProfile }) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">{location.district}</p>
      <h3 className="mt-4 font-serif text-3xl text-[color:var(--ink)]">{location.name}</h3>
      <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{location.description}</p>

      <div className="mt-6 space-y-2 text-sm text-[color:var(--muted-strong)]">
        <p className="inline-flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{location.address}</span>
        </p>
        <p className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4 shrink-0" />
          <span>{location.workingHours}</span>
        </p>
      </div>

      <Link
        href={`/locations/${location.slug}`}
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--accent-strong)]"
      >
        Страница филиала
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
