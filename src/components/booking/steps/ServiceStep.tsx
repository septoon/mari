'use client';

import { Search } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';

import type { Service } from '@/lib/api/contracts';
import { formatDuration, formatPriceRange } from '@/lib/format';

type ServiceStepProps = {
  services: Service[];
  selectedCategoryId: string | null;
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
};

export function ServiceStep({
  services,
  selectedCategoryId,
  selectedServiceId,
  onSelect
}: ServiceStepProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const filteredServices = useMemo(
    () =>
      services.filter((service) => {
        if (selectedCategoryId && service.category.id !== selectedCategoryId) {
          return false;
        }

        if (!deferredQuery) {
          return true;
        }

        return [service.name, service.nameOnline ?? '', service.description ?? '', service.category.name]
          .join(' ')
          .toLowerCase()
          .includes(deferredQuery);
      }),
    [deferredQuery, selectedCategoryId, services]
  );

  return (
    <div className="space-y-4">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-strong)]" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Найти услугу"
          className="w-full rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[color:var(--accent-strong)]"
        />
      </label>

      {filteredServices.length ? (
        <div className="grid gap-3">
          {filteredServices.map((service) => {
            const active = service.id === selectedServiceId;

            return (
              <button
                key={service.id}
                type="button"
                onClick={() => onSelect(service.id)}
                aria-pressed={active}
                className={`rounded-[1.6rem] border px-5 py-4 text-left transition ${
                  active
                    ? 'border-[color:var(--foreground)] bg-[color:var(--foreground)] text-white shadow-[0_18px_48px_rgba(8,36,40,0.14)]'
                    : 'border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--panel)]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-lg font-semibold">{service.nameOnline ?? service.name}</p>
                    <p className={`mt-2 text-sm leading-6 ${active ? 'text-white/80' : 'text-[color:var(--muted)]'}`}>
                      {service.description?.trim() || 'Онлайн-запись доступна для этой услуги.'}
                    </p>
                  </div>
                  <div className={`shrink-0 text-right text-sm ${active ? 'text-white/80' : 'text-[color:var(--muted-strong)]'}`}>
                    <p>{formatDuration(service.durationSec)}</p>
                    <p className={`mt-1 text-base font-semibold ${active ? 'text-white' : 'text-[color:var(--ink)]'}`}>
                      {formatPriceRange(service.priceMin, service.priceMax)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 text-sm text-[color:var(--muted)]">
          По текущему фильтру услуги не найдены.
        </div>
      )}
    </div>
  );
}
