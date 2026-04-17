import Link from 'next/link';
import { ArrowRight, Clock3, ImageIcon, MapPin } from 'lucide-react';

import type { LocationProfile } from '@/content/types';

export function LocationCard({ location }: { location: LocationProfile }) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-(--line)">
        {location.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={location.imageUrl} alt={location.name} className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 w-full items-center justify-center bg-[linear-gradient(145deg,rgba(247,241,234,0.9),rgba(255,255,255,0.98))] text-(--muted)">
            <div className="text-center">
              <ImageIcon className="mx-auto h-8 w-8 text-(--accent-strong)" />
              <p className="mt-3 text-sm font-medium">Место под фото филиала</p>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">{location.district}</p>
      <h3 className="mt-4 font-serif text-3xl text-(--ink)">{location.name}</h3>
      <p className="mt-4 text-sm leading-7 text-(--muted)">{location.description}</p>

      <div className="mt-6 space-y-2 text-sm text-(--muted-strong)">
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
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-(--foreground) transition hover:text-(--accent-strong)"
      >
        Страница филиала
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
