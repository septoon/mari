'use client';

import Link from 'next/link';
import { Search, Sparkles } from 'lucide-react';
import { useDeferredValue, useState } from 'react';

import { formatDuration, formatPriceRange } from '@/lib/format';
import type { Service } from '@/lib/api/contracts';

type ServiceCatalogProps = {
  services: Service[];
};

export function ServiceCatalog({ services }: ServiceCatalogProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const categories = ['all', ...new Set(services.map((service) => service.category.name))];
  const filteredServices = services.filter((service) => {
    const categoryMatches = activeCategory === 'all' || service.category.name === activeCategory;
    const searchMatches =
      deferredSearch.length === 0 ||
      [service.name, service.nameOnline ?? '', service.description ?? '', service.category.name]
        .join(' ')
        .toLowerCase()
        .includes(deferredSearch);

    return categoryMatches && searchMatches;
  });

  return (
    <section id="services" className="rounded-[2rem] border border-white/60 bg-white/58 px-6 py-8 shadow-[0_30px_90px_rgba(12,77,85,0.08)] backdrop-blur md:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="section-kicker">Услуги</p>
          <h2 className="section-title">Каталог услуг для быстрого и удобного выбора.</h2>
          <p className="section-copy">
            Фильтруйте по направлению, выбирайте удобную длительность и сразу отправляйте услугу в форму записи.
          </p>
        </div>
        <label className="relative block w-full max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-(--ink-muted)" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по услугам"
            className="w-full rounded-full border border-(--line) bg-(--panel-strong) py-3 pl-11 pr-4 text-sm outline-none transition focus:border-(--ink)"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              activeCategory === category
                ? 'bg-(--button-bg) text-white'
                : 'border border-(--line) bg-white/70 text-(--ink)'
            }`}
          >
            {category === 'all' ? 'Все направления' : category}
          </button>
        ))}
      </div>

      {filteredServices.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] border border-dashed border-(--line) bg-(--panel) px-6 py-10 text-sm text-(--ink-muted)">
          По выбранным параметрам услуги не найдены. Попробуйте изменить направление или поисковый запрос.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredServices.map((service) => (
            <article
              key={service.id}
              className="group rounded-[1.5rem] border border-(--line) bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(242,239,235,0.84))] p-5 shadow-[0_18px_40px_rgba(12,77,85,0.06)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-(--ink-muted)">{service.category.name}</p>
                  <h3 className="mt-3 font-serif text-2xl text-(--ink)">{service.nameOnline ?? service.name}</h3>
                </div>
                <span className="rounded-full bg-(--mist) px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-(--ink)">
                  {formatDuration(service.durationSec)}
                </span>
              </div>

              <p className="mt-3 min-h-12 text-sm leading-6 text-(--ink-muted)">
                {service.description || 'Уход с вниманием к форме, оттенку и общему комфорту во время визита.'}
              </p>

              <div className="mt-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-(--ink-muted)">Стоимость</p>
                  <p className="mt-1 text-lg font-semibold text-(--ink)">
                    {formatPriceRange(service.priceMin, service.priceMax)}
                  </p>
                </div>

                <Link
                  href={`/booking?serviceId=${service.id}`}
                  className="inline-flex items-center gap-2 rounded-full bg-(--button-bg) px-4 py-2 text-sm font-medium text-white transition hover:translate-y-[-1px] hover:bg-(--button-bg-hover)"
                >
                  <Sparkles className="h-4 w-4" />
                  Выбрать
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
