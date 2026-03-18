'use client';

import type { SlotDaysResult } from '@/lib/api/contracts';
import { formatBookingDate, weekdayLabel } from '@/lib/format';

type DateStepProps = {
  slotDays: SlotDaysResult | null;
  selectedDate: string | null;
  loading: boolean;
  error: string | null;
  onSelect: (date: string) => void;
};

const weekdayFormatter = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];

export function DateStep({
  slotDays,
  selectedDate,
  loading,
  error,
  onSelect
}: DateStepProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 21 }, (_, index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-[1rem] bg-[color:var(--panel)]"
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
      <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 text-sm text-[color:var(--muted)]">
        Сначала выберите специалиста.
      </div>
    );
  }

  const firstAvailable = slotDays.items.find((item) => item.hasSlots)?.date ?? null;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-[0.18em] text-[color:var(--muted-strong)]">
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
                  ? 'border-[color:var(--foreground)] bg-[color:var(--foreground)] text-white'
                  : item.hasSlots
                    ? 'border-[color:var(--line)] bg-white text-[color:var(--ink)] hover:border-[color:var(--accent-strong)] hover:bg-[color:var(--panel)]'
                    : 'cursor-not-allowed border-[color:var(--line)] bg-[color:var(--panel)] text-[color:var(--muted-strong)] opacity-60'
              }`}
            >
              <span className="block text-base font-semibold">
                {new Date(`${item.date}T00:00:00`).getDate()}
              </span>
              <span className={`mt-1 block text-[11px] ${active ? 'text-white/75' : 'text-[color:var(--muted-strong)]'}`}>
                {item.totalSlots > 0 ? item.totalSlots : 'нет'}
              </span>
            </button>
          );
        })}
      </div>

      {selectedDate ? (
        <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-4 text-sm text-[color:var(--muted)]">
          <p className="font-medium text-[color:var(--ink)]">{formatBookingDate(selectedDate)}</p>
          <p className="mt-1">{weekdayLabel(selectedDate)}</p>
        </div>
      ) : firstAvailable ? (
        <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-4 text-sm text-[color:var(--muted)]">
          <p>Ближайшая доступная дата:</p>
          <button
            type="button"
            onClick={() => onSelect(firstAvailable)}
            className="mt-3 inline-flex rounded-full bg-[color:var(--button-bg)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:var(--button-bg-hover)]"
          >
            {formatBookingDate(firstAvailable)}
          </button>
        </div>
      ) : (
        <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 text-sm text-[color:var(--muted)]">
          Свободных дат в ближайшие недели пока нет.
        </div>
      )}
    </div>
  );
}
