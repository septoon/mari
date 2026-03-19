'use client';

import { Search } from 'lucide-react';
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

import type { Service } from '@/lib/api/contracts';
import { formatDuration, formatPriceRange } from '@/lib/format';

type ServiceStepProps = {
  services: Service[];
  selectedCategoryId: string | null;
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
  variant: 'page' | 'sheet';
};

export function ServiceStep({
  services,
  selectedCategoryId,
  selectedServiceId,
  onSelect,
  variant
}: ServiceStepProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const scrollRootRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const [stickyHeight, setStickyHeight] = useState(0);
  const groupedServices = useMemo(() => {
    const visibleServices = services.filter((service) => {
      if (!deferredQuery) {
        return true;
      }

      return [service.name, service.nameOnline ?? '', service.description ?? '', service.category.name]
        .join(' ')
        .toLowerCase()
        .includes(deferredQuery);
    });

    const groups = new Map<
      string,
      {
        id: string;
        name: string;
        items: Service[];
      }
    >();

    for (const service of visibleServices) {
      const existing = groups.get(service.category.id);

      if (existing) {
        existing.items.push(service);
        continue;
      }

      groups.set(service.category.id, {
        id: service.category.id,
        name: service.category.name,
        items: [service]
      });
    }

    return Array.from(groups.values());
  }, [deferredQuery, services]);
  const selectedServiceCategoryId = useMemo(
    () => services.find((service) => service.id === selectedServiceId)?.category.id ?? null,
    [selectedServiceId, services]
  );
  const preferredCategoryId = selectedServiceCategoryId ?? selectedCategoryId;
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(() => {
    return groupedServices.some((group) => group.id === preferredCategoryId)
      ? preferredCategoryId
      : groupedServices[0]?.id ?? null;
  });
  const resolvedActiveCategoryId = useMemo(() => {
    if (activeCategoryId && groupedServices.some((group) => group.id === activeCategoryId)) {
      return activeCategoryId;
    }

    if (preferredCategoryId && groupedServices.some((group) => group.id === preferredCategoryId)) {
      return preferredCategoryId;
    }

    return groupedServices[0]?.id ?? null;
  }, [activeCategoryId, groupedServices, preferredCategoryId]);

  const setSectionRef = useCallback((categoryId: string, node: HTMLElement | null) => {
    if (node) {
      sectionRefs.current.set(categoryId, node);
      return;
    }

    sectionRefs.current.delete(categoryId);
  }, []);

  const syncActiveCategory = useCallback(() => {
    if (!groupedServices.length) {
      return;
    }

    const offset = stickyHeight + 24;
    let nextCategoryId = groupedServices[0].id;

    for (const group of groupedServices) {
      const section = sectionRefs.current.get(group.id);
      if (!section) {
        continue;
      }

      if (section.getBoundingClientRect().top - offset <= 0) {
        nextCategoryId = group.id;
        continue;
      }

      break;
    }

    setActiveCategoryId((current) => (current === nextCategoryId ? current : nextCategoryId));
  }, [groupedServices, stickyHeight]);

  useEffect(() => {
    scrollRootRef.current = rootRef.current?.closest('.react-modal-sheet-content-scroller') as HTMLElement | null;
  }, []);

  useEffect(() => {
    const updateStickyHeight = () => {
      setStickyHeight(stickyRef.current?.offsetHeight ?? 0);
    };

    updateStickyHeight();

    if (!stickyRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(updateStickyHeight);
    observer.observe(stickyRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const target = scrollRootRef.current ?? window;
    const handlePositionChanged = () => {
      syncActiveCategory();
    };

    handlePositionChanged();
    target.addEventListener('scroll', handlePositionChanged, { passive: true });
    window.addEventListener('resize', handlePositionChanged);

    return () => {
      target.removeEventListener('scroll', handlePositionChanged);
      window.removeEventListener('resize', handlePositionChanged);
    };
  }, [syncActiveCategory]);

  const scrollToCategory = useCallback((categoryId: string) => {
    const section = sectionRefs.current.get(categoryId);
    if (!section) {
      return;
    }

    setActiveCategoryId(categoryId);
    section.scrollIntoView({
      block: 'start',
      behavior: 'smooth'
    });
  }, []);

  return (
    <div ref={rootRef} className="space-y-4">
      <div
        ref={stickyRef}
        className={`z-10 space-y-3 bg-[color:var(--background)] pb-4 ${variant === 'sheet' ? 'sticky top-0 -mx-4 px-4 sm:-mx-6 sm:px-6' : 'sticky top-0'}`}
      >
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted-strong)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Найти услугу"
            className="w-full rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[color:var(--accent-strong)]"
          />
        </label>

        {groupedServices.length > 1 ? (
          <div className="overflow-x-auto pb-1">
            <div className="flex w-max gap-2 pr-4">
              {groupedServices.map((group) => {
                const active = group.id === resolvedActiveCategoryId;

                return (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => scrollToCategory(group.id)}
                    aria-pressed={active}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      active
                        ? 'border-[color:var(--foreground)] bg-[color:var(--foreground)] text-white'
                        : 'border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--panel)]'
                    }`}
                  >
                    {group.name}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {groupedServices.length ? (
        <div className="space-y-6">
          {groupedServices.map((group) => (
            <section
              key={group.id}
              ref={(node) => setSectionRef(group.id, node)}
              style={{ scrollMarginTop: stickyHeight + 24 }}
              className="space-y-3"
            >
              {groupedServices.length > 1 ? (
                <h3 className="text-2xl font-semibold text-[color:var(--ink)]">{group.name}</h3>
              ) : null}

              <div className="grid gap-3">
                {group.items.map((service) => {
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
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 text-sm text-[color:var(--muted)]">
          По текущему фильтру услуги не найдены.
        </div>
      )}
    </div>
  );
}
