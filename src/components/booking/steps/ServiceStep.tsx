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
};

export function ServiceStep({
  services,
  selectedCategoryId,
  selectedServiceId,
  onSelect
}: ServiceStepProps) {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const rootRef = useRef<HTMLDivElement>(null);
  const categoryRailRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const categoryChipRefs = useRef(new Map<string, HTMLButtonElement>());
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

  const setCategoryChipRef = useCallback((categoryId: string, node: HTMLButtonElement | null) => {
    if (node) {
      categoryChipRefs.current.set(categoryId, node);
      return;
    }

    categoryChipRefs.current.delete(categoryId);
  }, []);

  const getSectionScrollTop = useCallback((section: HTMLElement, scrollContainer: HTMLDivElement) => {
    return (
      section.getBoundingClientRect().top -
      scrollContainer.getBoundingClientRect().top +
      scrollContainer.scrollTop
    );
  }, []);

  const syncActiveCategory = useCallback(() => {
    const scrollContainer = listScrollRef.current;

    if (!groupedServices.length || !scrollContainer) {
      return;
    }

    const marker = scrollContainer.scrollTop + 24;
    const metrics = groupedServices
      .map((group) => {
        const section = sectionRefs.current.get(group.id);
        if (!section) {
          return null;
        }

        const top = getSectionScrollTop(section, scrollContainer);
        return {
          id: group.id,
          top,
          bottom: top + section.offsetHeight
        };
      })
      .filter(Boolean) as Array<{ id: string; top: number; bottom: number }>;

    if (!metrics.length) {
      return;
    }

    const currentSection =
      metrics.find((section) => section.top <= marker && section.bottom > marker) ??
      metrics.find((section) => section.top > marker) ??
      metrics[metrics.length - 1];

    const nextCategoryId = currentSection?.id ?? groupedServices[0].id;

    setActiveCategoryId((current) => (current === nextCategoryId ? current : nextCategoryId));
  }, [getSectionScrollTop, groupedServices]);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(syncActiveCategory);
    window.addEventListener('resize', syncActiveCategory);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', syncActiveCategory);
    };
  }, [syncActiveCategory]);

  useEffect(() => {
    if (!resolvedActiveCategoryId) {
      return;
    }

    const rail = categoryRailRef.current;
    const chip = categoryChipRefs.current.get(resolvedActiveCategoryId);

    if (!rail || !chip) {
      return;
    }

    const railLeft = rail.scrollLeft;
    const railRight = railLeft + rail.clientWidth;
    const chipLeft = chip.offsetLeft;
    const chipRight = chipLeft + chip.offsetWidth;

    if (chipLeft >= railLeft && chipRight <= railRight) {
      return;
    }

    const nextLeft = Math.max(0, chipLeft - (rail.clientWidth - chip.offsetWidth) / 2);
    rail.scrollTo({
      left: nextLeft,
      behavior: 'smooth'
    });
  }, [resolvedActiveCategoryId]);

  const scrollToCategory = useCallback((categoryId: string) => {
    const section = sectionRefs.current.get(categoryId);
    const scrollContainer = listScrollRef.current;
    if (!section || !scrollContainer) {
      return;
    }

    setActiveCategoryId(categoryId);
    scrollContainer.scrollTo({
      top: Math.max(0, getSectionScrollTop(section, scrollContainer) - 12),
      behavior: 'smooth'
    });
  }, [getSectionScrollTop]);

  return (
    <div
      ref={rootRef}
      className="flex h-full min-h-0 max-w-full flex-1 flex-col space-y-4 overflow-x-hidden"
    >
      <div className="z-10 max-w-full shrink-0 space-y-3 overflow-x-hidden bg-[color:var(--background)] pb-4">
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
          <div
            ref={categoryRailRef}
            className="max-w-full overflow-x-auto overscroll-x-contain pb-1 touch-pan-x"
          >
            <div className="flex min-w-max gap-2 pr-4">
              {groupedServices.map((group) => {
                const active = group.id === resolvedActiveCategoryId;

                return (
                  <button
                    key={group.id}
                    ref={(node) => setCategoryChipRef(group.id, node)}
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
        <div
          ref={listScrollRef}
          onScroll={syncActiveCategory}
          className="min-h-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-x-none pb-2 touch-pan-y"
        >
          <div className="min-w-0 max-w-full space-y-6 overflow-x-hidden">
            {groupedServices.map((group) => (
              <section
                key={group.id}
                ref={(node) => setSectionRef(group.id, node)}
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
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 text-sm text-[color:var(--muted)]">
          По текущему фильтру услуги не найдены.
        </div>
      )}
    </div>
  );
}
