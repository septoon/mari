'use client';

import type { BookingSlotSelection } from '@/lib/booking/types';
import { groupSlotsByTimeOfDay } from '@/lib/booking/utils';
import type { SlotsResult } from '@/lib/api/contracts';
import { formatTime } from '@/lib/format';

type TimeStepProps = {
  slots: SlotsResult | null;
  selectedSlot: BookingSlotSelection | null;
  loading: boolean;
  error: string | null;
  onSelect: (slot: BookingSlotSelection) => void;
};

export function TimeStep({
  slots,
  selectedSlot,
  loading,
  error,
  onSelect
}: TimeStepProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="space-y-3">
            <div className="h-5 w-28 animate-pulse rounded-full bg-[color:var(--panel)]" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Array.from({ length: 6 }, (__unused, slotIndex) => (
                <div
                  key={slotIndex}
                  className="h-12 animate-pulse rounded-[1rem] bg-[color:var(--panel)]"
                />
              ))}
            </div>
          </div>
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

  const groupedSlots = groupSlotsByTimeOfDay(slots);

  if (!groupedSlots.length) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 text-sm text-[color:var(--muted)]">
        На выбранную дату свободного времени пока нет. Вернитесь к дате или специалисту.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groupedSlots.map((group) => (
        <section key={group.label} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-[color:var(--ink)]">{group.label}</h3>
            <span className="text-xs text-[color:var(--muted-strong)]">{group.items.length} слотов</span>
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
                    onSelect({
                      staffId: slot.staffId,
                      staffName: slot.staffName,
                      startAt: slot.startAt,
                      endAt: slot.endAt
                    })
                  }
                  aria-pressed={active}
                  className={`rounded-[1rem] border px-4 py-3 text-sm font-medium transition ${
                    active
                      ? 'border-[color:var(--foreground)] bg-[color:var(--foreground)] text-white'
                      : 'border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--panel)]'
                  }`}
                >
                  {formatTime(slot.startAt)}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
