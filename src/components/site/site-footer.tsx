import Link from 'next/link';

import { Container } from '@/components/ui/container';
import { getLiveCatalog } from '@/lib/live-catalog';
import { siteConfig } from '@/lib/site';

export async function SiteFooter() {
  const catalog = await getLiveCatalog();
  const salon = catalog.salon;

  return (
    <footer className="border-t border-[color:var(--line)] bg-white/58">
      <Container className="py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <p className="font-serif text-4xl tracking-[0.18em] text-[color:var(--ink)]">MARI</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              Салон красоты с тёплой атмосферой, сильными специалистами и удобной записью на любимые процедуры.
            </p>
            <div className="mt-6 space-y-2 text-sm text-[color:var(--muted-strong)]">
              <a href={salon.phoneHref} className="block transition hover:text-[color:var(--foreground)]">
                {salon.phone}
              </a>
              <a href={`mailto:${salon.email}`} className="block transition hover:text-[color:var(--foreground)]">
                {salon.email}
              </a>
              <p>{salon.address}</p>
            </div>
          </div>

          {siteConfig.footerNav.map((group) => (
            <div key={group.title}>
              <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">{group.title}</p>
              <ul className="mt-5 space-y-3 text-sm text-[color:var(--foreground)]">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="transition hover:text-[color:var(--accent-strong)]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-[color:var(--line)] pt-6 text-sm text-[color:var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Mari Beauty Salon</p>
          <div className="flex gap-4">
            <Link href="/news" className="transition hover:text-[color:var(--foreground)]">
              Новости
            </Link>
            <Link href="/careers" className="transition hover:text-[color:var(--foreground)]">
              Вакансии
            </Link>
            <Link href="/gift-cards" className="transition hover:text-[color:var(--foreground)]">
              Сертификаты
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
