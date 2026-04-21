import Link from 'next/link';
import { ArrowUpRight, ImageIcon } from 'lucide-react';

export function ServiceSectionCard({
  section,
}: {
  section: {
    slug: string;
    name: string;
    imageUrl?: string | null;
    categories: Array<{
      id: string;
      slug: string;
      name: string;
    }>;
    servicesCount: number;
  };
}) {
  return (
    <Link
      href={`#${section.slug}`}
      className="group surface-card flex h-full flex-col justify-between overflow-hidden p-6 transition duration-200 hover:-translate-y-0.5 hover:border-(--accent-strong) hover:bg-white"
    >
      <div>
        <div className="mb-5 overflow-hidden rounded-[1.5rem] border border-(--line)">
          {section.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={section.imageUrl}
              alt={section.name}
              className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-44 w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(145deg,rgba(247,241,234,0.9),rgba(255,255,255,0.98))] text-(--muted)">
              <ImageIcon className="h-8 w-8 text-(--accent-strong)" />
              <p className="text-sm font-medium">Место под фото раздела</p>
            </div>
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">Раздел услуг</p>
        <h3 className="mt-4 font-serif text-3xl text-(--ink)">{section.name}</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {section.categories.map((category) => (
            <span
              key={category.id}
              className="rounded-full border border-(--line) bg-[color:rgba(255,255,255,0.84)] px-3 py-1 text-xs text-(--foreground)"
            >
              {category.name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-between text-sm text-(--foreground)">
        <span>{section.servicesCount} услуг</span>
        <span className="inline-flex items-center gap-2">
          Открыть
          <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
