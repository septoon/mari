'use client';

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { UsersRound } from 'lucide-react';

import type { SpecialistCard } from '@/lib/api/contracts';
import { fetchSlotDays, fetchSlots } from '@/lib/booking/client';
import { getLocalDate, getPreviewServiceIdForSpecialist } from '@/lib/booking/utils';
import type { BookingSlotSelection } from '@/lib/booking/types';
import { formatBookingDate, formatTime, weekdayLabel } from '@/lib/format';

type StaffStepProps = {
  specialists: SpecialistCard[];
  selectedStaffId: string | 'any' | null;
  canChooseAnyStaff: boolean;
  selectedServiceId: string | null;
  onSelect: (staffId: string | 'any') => void;
  onOpenCalendar: (options?: { staffId?: string | 'any'; date?: string | null }) => void;
  onSelectPreviewSlot: (slot: BookingSlotSelection) => void;
};

type StaffPreview = {
  date: string | null;
  slots: BookingSlotSelection[];
  loading: boolean;
};

type PreviewTarget = {
  staffId: string | 'any';
  serviceId: string;
};

const EMPTY_PREVIEW: StaffPreview = {
  date: null,
  slots: [],
  loading: false
};
const PREVIEW_CACHE_TTL_MS = 30_000;

type PreviewCacheEntry = {
  preview: StaffPreview;
  fetchedAt: number;
};

const Avatar = ({ specialist }: { specialist?: SpecialistCard }) => {
  if (specialist?.photo?.preferredUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={specialist.photo.preferredUrl} alt={specialist.name} className="h-full w-full object-cover" />;
  }

  return specialist ? specialist.name.charAt(0).toUpperCase() : <UsersRound className="h-5 w-5" />;
};

const SelectionIndicator = ({ active }: { active: boolean }) => (
  <span
    className={`mt-1 inline-flex h-7 w-7 shrink-0 rounded-full border transition ${
      active
        ? 'border-(--foreground) bg-(--foreground) shadow-[inset_0_0_0_6px_white]'
        : 'border-(--line-strong) bg-white'
    }`}
  />
);

const formatPreviewDate = (date: string) => `${weekdayLabel(date).replace('.', '')}, ${formatBookingDate(date)}`;

const getPreviewKey = (serviceId: string, staffId: string | 'any') => `${serviceId}:${staffId}`;

const getFreshPreview = (
  cache: Map<string, PreviewCacheEntry>,
  key: string
) => {
  const cached = cache.get(key);
  if (!cached) {
    return null;
  }

  if (Date.now() - cached.fetchedAt > PREVIEW_CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return cached.preview;
};

export function StaffStep({
  specialists,
  selectedStaffId,
  canChooseAnyStaff,
  selectedServiceId,
  onSelect,
  onOpenCalendar,
  onSelectPreviewSlot
}: StaffStepProps) {
  const [previews, setPreviews] = useState<Record<string, StaffPreview>>({});
  const [previewVersion, refreshPreviews] = useReducer((value: number) => value + 1, 0);
  const previewCacheRef = useRef(new Map<string, PreviewCacheEntry>());
  const invalidatePreviews = useCallback(() => {
    previewCacheRef.current.clear();
    refreshPreviews();
  }, []);
  const previewTargets = useMemo<PreviewTarget[]>(
    () => [
      ...(canChooseAnyStaff && selectedServiceId ? [{ staffId: 'any' as const, serviceId: selectedServiceId }] : []),
      ...specialists.flatMap((specialist) => {
        const serviceId = selectedServiceId ?? getPreviewServiceIdForSpecialist(specialist);

        if (!serviceId) {
          return [];
        }

        return [
          {
            staffId: specialist.staffId,
            serviceId
          }
        ];
      })
    ],
    [canChooseAnyStaff, selectedServiceId, specialists]
  );
  const resolvedPreviews = previewTargets.length ? previews : {};

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        invalidatePreviews();
      }
    };

    window.addEventListener('focus', invalidatePreviews);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', invalidatePreviews);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [invalidatePreviews]);

  useEffect(() => {
    if (!previewTargets.length) {
      return;
    }

    const controller = new AbortController();
    const from = getLocalDate();

    setPreviews((current) =>
      Object.fromEntries(
        previewTargets.map(({ staffId, serviceId }) => {
          const cacheKey = getPreviewKey(serviceId, staffId);
          return [
            staffId,
            getFreshPreview(previewCacheRef.current, cacheKey) ??
              current[staffId] ??
              { ...EMPTY_PREVIEW, loading: true }
          ];
        })
      )
    );

    void Promise.all(
      previewTargets.map(async ({ staffId, serviceId }) => {
        const cacheKey = getPreviewKey(serviceId, staffId);
        const cached = getFreshPreview(previewCacheRef.current, cacheKey);

        if (cached) {
          return [staffId, cached] as const;
        }

        const slotDays = await fetchSlotDays({
          from,
          serviceId,
          staffId,
          signal: controller.signal
        });
        const firstAvailableDate = slotDays.items.find((item) => item.hasSlots)?.date ?? null;

        if (!firstAvailableDate) {
          const emptyPreview = { ...EMPTY_PREVIEW };
          previewCacheRef.current.set(cacheKey, {
            preview: emptyPreview,
            fetchedAt: Date.now()
          });
          return [staffId, emptyPreview] as const;
        }

        const slots = await fetchSlots({
          date: firstAvailableDate,
          serviceId,
          staffId,
          signal: controller.signal
        });
        const source =
          staffId === 'any'
            ? slots.results.flatMap((group) =>
                group.slots.map((slot) => ({
                  staffId: group.staffId,
                  staffName: group.staffName,
                  startAt: slot.startAt,
                  endAt: slot.endAt
                }))
              )
            : (slots.results.find((group) => group.staffId === staffId)?.slots ?? []).map((slot) => ({
                staffId,
                staffName: slots.results.find((group) => group.staffId === staffId)?.staffName ?? '',
                startAt: slot.startAt,
                endAt: slot.endAt
              }));
        const orderedSlots = source
          .slice()
          .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime());
        const uniqueSlots = Array.from(new Map(orderedSlots.map((slot) => [slot.startAt, slot])).values());

        const preview = {
          date: firstAvailableDate,
          slots: uniqueSlots.slice(0, 5),
          loading: false
        } satisfies StaffPreview;

        previewCacheRef.current.set(cacheKey, {
          preview,
          fetchedAt: Date.now()
        });
        return [staffId, preview] as const;
      })
    )
      .then((entries) => {
        if (controller.signal.aborted) {
          return;
        }

        setPreviews((current) => ({
          ...current,
          ...Object.fromEntries(entries)
        }));
      })
      .catch(() => {
        if (controller.signal.aborted) {
          return;
        }

        setPreviews((current) =>
          Object.fromEntries(
            previewTargets.map(({ staffId }) => [staffId, current[staffId] ?? { ...EMPTY_PREVIEW }])
          )
        );
      });

    return () => controller.abort();
  }, [previewTargets, previewVersion]);

  if (!specialists.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-(--line) bg-(--panel) px-5 py-6 text-sm text-(--muted)">
        Для выбранной услуги сейчас нет специалистов с онлайн-записью.
      </div>
    );
  }

  const renderPreview = (preview: StaffPreview, staffId: string | 'any') => {
    if (preview.loading) {
      return (
        <div className="mt-4 ml-[4.5rem] space-y-3">
          <div className="h-4 w-56 animate-pulse rounded-full bg-(--panel)" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="h-10 w-20 animate-pulse rounded-[0.95rem] bg-(--panel)" />
            ))}
          </div>
        </div>
      );
    }

    if (!preview.date || !preview.slots.length) {
      return (
        <p className="mt-4 ml-[4.5rem] text-sm leading-6 text-(--muted)">
          На ближайшие дни свободных окон по этой услуге пока нет.
        </p>
      );
    }

    return (
      <div className="mt-4 ml-[4.5rem] space-y-3">
        <p className="text-sm font-medium text-(--muted-strong)">
          Ближайшее время для записи {formatPreviewDate(preview.date)}:
        </p>

        <div className="flex flex-wrap gap-2">
          {preview.slots.map((slot) => (
            <button
              key={`${slot.staffId}:${slot.startAt}`}
              type="button"
              onClick={() => onSelectPreviewSlot(slot)}
              className="rounded-[0.95rem] bg-(--panel) px-4 py-2 text-sm font-medium text-(--ink) transition hover:bg-(--surface-strong)"
            >
              {formatTime(slot.startAt)}
            </button>
          ))}

          <button
            type="button"
            onClick={() => onOpenCalendar({ staffId, date: preview.date })}
            className="rounded-[0.95rem] bg-(--panel) px-4 py-2 text-sm font-medium text-(--ink) transition hover:bg-(--surface-strong)"
          >
            Другое время
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="pb-6">
      <div className="overflow-hidden rounded-[1.9rem] border border-(--line) bg-white">
        {canChooseAnyStaff ? (
          <article
            className={`px-5 py-5 transition ${selectedStaffId === 'any' ? 'bg-(--panel)' : 'bg-white'} ${
              specialists.length > 0 ? 'border-b border-(--line)' : ''
            }`}
          >
            <button type="button" onClick={() => onSelect('any')} className="flex w-full items-start gap-4 text-left">
              <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-(--panel) text-(--foreground)">
                <Avatar />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.6rem] font-semibold leading-none text-(--ink)">
                  Любой специалист
                </span>
                <span className="mt-2 block text-sm leading-6 text-(--muted)">
                  {selectedServiceId
                    ? 'Подберём ближайшее свободное окно у подходящего мастера.'
                    : 'Покажем всех специалистов, а затем сузим список услуг и времени.'}
                </span>
              </span>
              <SelectionIndicator active={selectedStaffId === 'any'} />
            </button>

            {selectedServiceId ? renderPreview(resolvedPreviews.any ?? EMPTY_PREVIEW, 'any') : null}
          </article>
        ) : null}

        {specialists.map((specialist, index) => {
          const active = selectedStaffId === specialist.staffId;
          const preview = resolvedPreviews[specialist.staffId] ?? EMPTY_PREVIEW;
          const showDivider = index < specialists.length - 1;

          return (
            <article
              key={specialist.staffId}
              className={`px-5 py-5 transition ${active ? 'bg-(--panel)' : 'bg-white'} ${
                showDivider ? 'border-b border-(--line)' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(specialist.staffId)}
                className="flex w-full items-start gap-4 text-left"
              >
                <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-(--panel) text-base font-semibold text-(--foreground)">
                  <Avatar specialist={specialist} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[1.6rem] font-semibold leading-none text-(--ink)">
                    {specialist.name}
                  </span>
                  <span className="mt-2 block text-base leading-6 text-(--muted)">
                    {specialist.specialty?.trim() || 'Специалист салона'}
                  </span>
                  {specialist.info?.trim() ? (
                    <span className="mt-1 block text-sm leading-6 text-(--muted)">
                      {specialist.info.trim()}
                    </span>
                  ) : null}
                </span>

                <SelectionIndicator active={active} />
              </button>

              {preview.loading || preview.date || preview.slots.length ? (
                renderPreview(preview, specialist.staffId)
              ) : (
                <p className="mt-4 ml-[4.5rem] text-sm leading-6 text-(--muted)">
                  После выбора мастера покажем только его услуги и ближайшее свободное время.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
