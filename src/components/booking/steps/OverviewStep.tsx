'use client';

import { CalendarDays, ChevronRight, ListFilter, UsersRound } from 'lucide-react';

type OverviewStepProps = {
  serviceLabel: string | null;
  staffLabel: string | null;
  dateLabel: string | null;
  onOpenServices: () => void;
  onOpenStaff: () => void;
  onOpenDate: () => void;
};

const cardBaseClassName =
  'flex w-full items-center gap-4 rounded-[1.75rem] border border-(--line) bg-white px-5 py-5 text-left transition hover:border-(--accent-strong) hover:bg-(--panel)';

export function OverviewStep({
  serviceLabel,
  staffLabel,
  dateLabel,
  onOpenServices,
  onOpenStaff,
  onOpenDate
}: OverviewStepProps) {
  return (
    <div className="space-y-3 pb-6">
      <button type="button" onClick={onOpenStaff} className={cardBaseClassName}>
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-(--panel) text-(--foreground)">
          <UsersRound className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold text-(--ink)">Выбрать специалиста</span>
          <span className="mt-1 block text-sm text-(--muted)">
            {staffLabel ?? (serviceLabel ? 'Откроем список доступных специалистов.' : 'Сначала выберите услугу.')}
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-(--muted-strong)" />
      </button>

      <button type="button" onClick={onOpenDate} className={cardBaseClassName}>
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-(--panel) text-(--foreground)">
          <CalendarDays className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold text-(--ink)">Выбрать дату и время</span>
          <span className="mt-1 block text-sm text-(--muted)">
            {dateLabel ??
              (serviceLabel
                ? 'Откроем календарь со свободным временем.'
                : 'Откроем календарь по текущему графику.')}
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-(--muted-strong)" />
      </button>

      <button type="button" onClick={onOpenServices} className={cardBaseClassName}>
        <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-(--panel) text-(--foreground)">
          <ListFilter className="h-6 w-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-semibold text-(--ink)">Выбрать услуги</span>
          <span className="mt-1 block text-sm text-(--muted)">
            {serviceLabel ?? 'Начните запись с выбора услуги.'}
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-(--muted-strong)" />
      </button>
    </div>
  );
}
