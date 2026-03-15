import type { ReactNode } from 'react';

import { Container } from '@/components/ui/container';
import { cn } from '@/lib/classnames';

export function CtaPanel({
  eyebrow,
  title,
  description,
  actions,
  className
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('py-10 md:py-14', className)}>
      <Container>
        <div className="rounded-[2rem] border border-[color:var(--line)] bg-[#1d5055] px-6 py-8 text-white shadow-[0_35px_100px_rgba(20,15,12,0.16)] md:px-10 md:py-10">
          <p className="text-xs uppercase tracking-[0.28em] text-white/62">{eyebrow}</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <h2 className="font-serif text-4xl leading-[1.02] md:text-5xl">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/72">{description}</p>
            </div>
            <div className="flex flex-wrap gap-3">{actions}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}
