import type { ReactNode } from 'react';

import { MariEmblem } from '@/components/mari-emblem';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Container } from '@/components/ui/container';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type AccountAuthShellProps = {
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description: string;
  heroKicker: string;
  heroTitle: string;
  heroDescription: string;
  heroNote: string;
  children: ReactNode;
};

export function AccountAuthShell({
  breadcrumbs,
  title,
  description,
  heroKicker,
  heroTitle,
  heroDescription,
  heroNote,
  children
}: AccountAuthShellProps) {
  return (
    <main className="pb-16 pt-8 md:pb-20 md:pt-12">
      <Container>
        <Breadcrumbs items={breadcrumbs} className="mb-6" />

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <aside className="relative overflow-hidden rounded-[2.2rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(242,236,230,0.98),rgba(231,239,236,0.94))] px-6 py-8 md:px-8 md:py-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              aria-hidden="true"
              style={{
                backgroundImage:
                  'radial-gradient(220px 140px at 10% 16%, rgba(255,255,255,0.6), transparent 70%), radial-gradient(320px 200px at 86% 10%, rgba(179,154,124,0.14), transparent 72%), radial-gradient(280px 180px at 80% 82%, rgba(12,77,85,0.1), transparent 74%)'
              }}
            />

            <div className="relative z-10 flex h-full flex-col justify-between gap-8">
              <div className="max-w-[34rem]">
                <p className="inline-flex rounded-full border border-white/70 bg-white/66 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">
                  {heroKicker}
                </p>
                <h2 className="mt-8 font-serif text-4xl leading-[1.02] text-[color:var(--ink)] md:text-6xl">
                  {heroTitle}
                </h2>
                <p className="mt-6 max-w-[32rem] text-base leading-8 text-[color:var(--muted)]">
                  {heroDescription}
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
                <div className="flex justify-center lg:justify-start">
                  <MariEmblem compact />
                </div>
                <div className="rounded-[1.7rem] border border-white/70 bg-white/66 p-5 text-sm leading-7 text-[color:var(--muted)] shadow-[0_20px_55px_rgba(12,77,85,0.08)]">
                  {heroNote}
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-[2.2rem] border border-[color:var(--line)] bg-white/82 px-6 py-8 shadow-[0_24px_70px_rgba(12,77,85,0.08)] md:px-8 md:py-10">
            <div className="max-w-[33rem]">
              <p className="section-kicker">Личный кабинет</p>
              <h1 className="section-title">{title}</h1>
              <p className="mt-5 text-base leading-8 text-[color:var(--muted)]">
                {description}
              </p>
            </div>

            <div className="mt-8">{children}</div>
          </section>
        </section>
      </Container>
    </main>
  );
}
