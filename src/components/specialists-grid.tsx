/* eslint-disable @next/next/no-img-element */

import { ArrowUpRight } from 'lucide-react';

import { formatDuration, formatPriceRange } from '@/lib/format';
import type { SpecialistCard } from '@/lib/api/contracts';

type SpecialistsGridProps = {
  specialists: SpecialistCard[];
};

export function SpecialistsGrid({ specialists }: SpecialistsGridProps) {
  return (
    <section id="specialists" className="rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel-strong)] px-6 py-8 md:px-8">
      <div className="max-w-2xl">
        <p className="section-kicker">Мастера</p>
        <h2 className="section-title">Люди, к которым хочется возвращаться.</h2>
        <p className="section-copy">
          Познакомьтесь со специалистами MARI, их направлением работы и процедурами, которые можно выбрать для визита.
        </p>
      </div>

      {specialists.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-[color:var(--line)] bg-white/70 px-6 py-10 text-sm text-[color:var(--ink-muted)]">
          Сейчас профили мастеров обновляются. Позвоните нам, и мы поможем выбрать специалиста.
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {specialists.map((specialist) => (
            <article
              key={specialist.staffId}
              className="overflow-hidden rounded-[1.7rem] border border-[color:var(--line)] bg-white shadow-[0_18px_46px_rgba(12,77,85,0.06)]"
            >
              <div className="aspect-[4/4.6] bg-[linear-gradient(180deg,rgba(204,213,210,0.9),rgba(233,239,237,0.7))]">
                {specialist.photo?.preferredUrl ? (
                  <img
                    src={specialist.photo.preferredUrl}
                    alt={specialist.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-8 text-center font-serif text-4xl text-[color:var(--ink-muted)]">
                    {specialist.name}
                  </div>
                )}
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">
                      {specialist.specialty || 'Специалист Mari'}
                    </p>
                    <h3 className="mt-2 font-serif text-3xl text-[color:var(--ink)]">{specialist.name}</h3>
                  </div>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] text-[color:var(--ink)]">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <p className="text-sm leading-6 text-[color:var(--ink-muted)]">
                  {specialist.info || 'Точный сервис, аккуратная техника и спокойная атмосфера без спешки.'}
                </p>

                <div className="space-y-2 rounded-[1.25rem] bg-[color:var(--panel)] p-4">
                  {specialist.services.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex items-start justify-between gap-4 text-sm">
                      <div>
                        <p className="font-medium text-[color:var(--ink)]">{service.name}</p>
                        <p className="mt-1 text-[color:var(--ink-muted)]">{formatDuration(service.durationSec)}</p>
                      </div>
                      <p className="whitespace-nowrap text-[color:var(--ink)]">
                        {formatPriceRange(service.priceMin, service.priceMax)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
