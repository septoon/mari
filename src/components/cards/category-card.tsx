import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function CategoryCard({
  category,
  serviceCount
}: {
  category: {
    slug: string;
    eyebrow: string;
    name: string;
    description: string;
  };
  serviceCount: number;
}) {
  return (
    <Link
      href={`/services/${category.slug}`}
      className="group surface-card flex h-full flex-col justify-between p-6 transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--accent-strong)] hover:bg-white"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">{category.eyebrow}</p>
        <h3 className="mt-4 font-serif text-3xl text-[color:var(--ink)]">{category.name}</h3>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{category.description}</p>
      </div>
      <div className="mt-8 flex items-center justify-between text-sm text-[color:var(--foreground)]">
        <span>{serviceCount} услуг</span>
        <span className="inline-flex items-center gap-2">
          Подробнее
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
