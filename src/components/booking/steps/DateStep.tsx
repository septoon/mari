'use client';

import type { BookingSlotSelection } from '@/lib/booking/types';
import type { SlotDaysResult, SlotsResult } from '@/lib/api/contracts';
import { groupSlotsByTimeOfDay } from '@/lib/booking/utils';
import { formatBookingDate, formatTime, weekdayLabel } from '@/lib/format';

type DateStepProps = {
  slotDays: SlotDaysResult | null;
  slots: SlotsResult | null;
  selectedDate: string | null;
  selectedSlot: BookingSlotSelection | null;
  loading: boolean;
  slotsLoading: boolean;
  error: string | null;
  slotsError: string | null;
  onSelect: (date: string) => void;
  onSelectSlot: (slot: BookingSlotSelection) => void;
};

const weekdayFormatter = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export function DateStep({
  slotDays,
  slots,
  selectedDate,
  selectedSlot,
  loading,
  slotsLoading,
  error,
  slotsError,
  onSelect,
  onSelectSlot
}: DateStepProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 21 }, (_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-[1rem] bg-(--panel)"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[1.5rem] border border-[#c4847d]/35 bg-[#f5dddb] px-5 py-4 text-sm text-[#7d3a37]">
        {error}
      </div>
    );
  }

  if (!slotDays?.items.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-(--line) bg-(--panel) px-5 py-6 text-sm text-(--muted)">
        Пока не удалось построить календарь. Выберите специалиста или услугу и попробуйте снова.
      </div>
    );
  }

  const firstAvailable = slotDays.items.find((item) => item.hasSlots)?.date ?? null;
  const groupedSlots = groupSlotsByTimeOfDay(slots);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-(--muted-strong)">
        {weekdayFormatter.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {slotDays.items.map((item) => {
          const active = item.date === selectedDate;

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => item.hasSlots && onSelect(item.date)}
              disabled={!item.hasSlots}
              aria-pressed={active}
              className={`rounded-[1rem] border px-2 py-3 text-center transition ${
                active
                  ? 'border-(--foreground) bg-(--foreground) text-white'
                  : item.hasSlots
                    ? 'border-(--line) bg-white text-(--ink) hover:border-(--accent-strong) hover:bg-(--panel)'
                    : 'cursor-not-allowed border-(--line) bg-(--panel) text-(--muted-strong) opacity-60'
              }`}
            >
              <span className="block text-base font-semibold">
                {new Date(`${item.date}T00:00:00`).getDate()}
              </span>
              <span className={`mt-1 block text-[11px] ${active ? 'text-white/75' : 'text-(--muted-strong)'}`}>
                {item.totalSlots > 0 ? item.totalSlots : 'нет'}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDate ? (
        <div className="rounded-[1.5rem] border border-(--line) bg-(--panel) px-5 py-4 text-sm text-(--muted)">
          <p className="font-medium text-(--ink)">{formatBookingDate(selectedDate)}</p>
          <p className="mt-1">{weekdayLabel(selectedDate)}</p>
        </div>
      ) : firstAvailable ? (
        <div className="rounded-[1.5rem] border border-(--line) bg-(--panel) px-5 py-4 text-sm text-(--muted)">
          <p>Ближайшая доступная дата:</p>
          <button
            type="button"
            onClick={() => onSelect(firstAvailable)}
            className="mt-3 inline-flex rounded-full bg-(--button-bg) px-4 py-2 text-sm font-medium text-white transition hover:bg-(--button-bg-hover)"
          >
            {formatBookingDate(firstAvailable)}
          </button>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-(--line) bg-(--panel) px-5 py-6 text-sm text-(--muted)">
          Свободных дат в ближайшие недели пока нет.
        </div>
      )}

      {selectedDate ? (
        <div className="space-y-5">
          {slotsLoading ? (
            <>
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="space-y-3">
                  <div className="h-5 w-24 animate-pulse rounded-full bg-(--panel)" />
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {Array.from({ length: 6 }, (__unused, slotIndex) => (
                      <div
                        key={slotIndex}
                        className="h-12 animate-pulse rounded-[1rem] bg-(--panel)"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : slotsError ? (
            <div className="rounded-[1.5rem] border border-[#c4847d]/35 bg-[#f5dddb] px-5 py-4 text-sm text-[#7d3a37]">
              {slotsError}
            </div>
          ) : groupedSlots.length ? (
            groupedSlots.map((group) => (
              <section key={group.label} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[1.65rem] font-semibold text-(--ink)">{group.label}</h3>
                  <span className="text-xs text-(--muted-strong)">{group.items.length} слотов</span>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {group.items.map((slot) => {
                    const active =
                      selectedSlot?.staffId === slot.staffId &&
                      selectedSlot?.startAt === slot.startAt;

                    return (
                      <button
                        key={`${slot.staffId}:${slot.startAt}`}
                        type="button"
                        onClick={() =>
                          onSelectSlot({
                            staffId: slot.staffId,
                            staffName: slot.staffName,
                            startAt: slot.startAt,
                            endAt: slot.endAt
                          })
                        }
                        aria-pressed={active}
                        className={`rounded-[1rem] px-4 py-3 text-sm font-medium transition ${
                          active
                            ? 'bg-(--foreground) text-white'
                            : 'bg-(--panel) text-(--ink) hover:bg-(--surface-strong)'
                        }`}
                      >
                        {formatTime(slot.startAt)}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-(--line) bg-(--panel) px-5 py-6 text-sm text-(--muted)">
              На выбранную дату свободного времени пока нет.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
