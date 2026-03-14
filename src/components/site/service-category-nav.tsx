import Link from 'next/link';

export function ServiceCategoryNav({
  categories,
}: {
  categories: Array<{
    slug: string;
    name: string;
  }>;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`#${category.slug}`}
          className="shrink-0 rounded-full border border-[color:var(--line)] bg-white/76 px-4 py-2.5 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--accent-strong)] hover:bg-white"
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
