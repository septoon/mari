import Link from 'next/link';
import { ArrowUpRight, ImageIcon } from 'lucide-react';

export function CategoryCard({
  category,
  serviceCount,
  labels
}: {
  category: {
    slug: string;
    eyebrow: string;
    name: string;
    description: string;
    imageUrl?: string | null;
  };
  serviceCount: number;
  labels?: {
    fallbackText?: string;
    serviceCountLabel?: string;
    actionLabel?: string;
  };
}) {
  const cardLabels = {
    fallbackText: labels?.fallbackText ?? 'Место под фото категории',
    serviceCountLabel: labels?.serviceCountLabel ?? `${serviceCount} услуг`,
    actionLabel: labels?.actionLabel ?? 'Подробнее',
  };

  return (
    <Link
      href={`/services/${category.slug}`}
      className="group surface-card flex h-full flex-col justify-between overflow-hidden p-6 transition duration-200 hover:-translate-y-0.5 hover:border-(--accent-strong) hover:bg-white"
    >
      <div>
        <div className="mb-5 aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-(--line)">
          {category.imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={category.imageUrl}
                alt={category.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,rgba(247,241,234,0.9),rgba(255,255,255,0.98))] text-(--muted)">
              <ImageIcon className="h-8 w-8 text-(--accent-strong)" />
              <p className="text-sm font-medium">{cardLabels.fallbackText}</p>
            </div>
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">{category.eyebrow}</p>
        <h3 className="mt-4 font-serif text-3xl text-(--ink)">{category.name}</h3>
        <p className="mt-4 text-sm leading-7 text-(--muted)">{category.description}</p>
      </div>
      <div className="mt-8 flex items-center justify-between text-sm text-(--foreground)">
        <span>{cardLabels.serviceCountLabel}</span>
        <span className="inline-flex items-center gap-2">
          {cardLabels.actionLabel}
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
