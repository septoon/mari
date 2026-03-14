import Link from 'next/link';
import { ArrowRight, BriefcaseBusiness } from 'lucide-react';

export function MasterCard({
  href,
  name,
  specialty,
  summary,
  servicesCount,
  categories,
}: {
  href: string;
  name: string;
  specialty: string;
  summary: string;
  servicesCount: number;
  categories: string[];
}) {
  return (
    <article className="surface-card flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">{specialty}</p>
          <h3 className="mt-4 font-serif text-3xl text-[color:var(--ink)]">{name}</h3>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface)] font-serif text-3xl text-[color:var(--ink)]">
          {name.charAt(0)}
        </div>
      </div>

      <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">{summary}</p>

      <div className="mt-6 space-y-2 text-sm text-[color:var(--muted-strong)]">
        <p>{servicesCount} услуг в онлайне</p>
        <p className="inline-flex items-start gap-2">
          <BriefcaseBusiness className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{categories.slice(0, 3).join(' · ')}</span>
        </p>
      </div>

      <Link
        href={href}
        className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[color:var(--foreground)] transition hover:text-[color:var(--accent-strong)]"
      >
        Профиль специалиста
        <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  );
}
