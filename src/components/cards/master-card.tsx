import Link from 'next/link';
import { ArrowRight, ImageIcon } from 'lucide-react';

export function MasterCard({
  href,
  name,
  specialty,
  summary,
  imageUrl,
}: {
  href: string;
  name: string;
  specialty: string;
  summary: string;
  servicesCount: number;
  categories: string[];
  imageUrl?: string | null;
}) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <div className='w-full flex justify-center'>
        <div className="mb-5 w-1/2 overflow-hidden rounded-[1.5rem] border border-(--line)">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="h-52 w-full object-cover" />
          ) : (
            <div className="flex h-52 w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,rgba(247,241,234,0.9),rgba(255,255,255,0.98))] text-(--muted)">
              <ImageIcon className="h-8 w-8 text-(--accent-strong)" />
              <p className="text-sm text-center font-medium">Место под фото специалиста</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">{specialty}</p>
          <h3 className="mt-4 font-serif text-3xl text-(--ink)">{name}</h3>
        </div>

      </div>

      <p className="mt-5 text-sm leading-7 text-(--muted)">{summary}</p>

      <Link
        href={href}
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-(--foreground) transition hover:text-(--accent-strong)"
      >
        Профиль специалиста
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
