'use client';

import { ArrowLeft, RotateCcw, X } from 'lucide-react';

type BookingStepHeaderProps = {
  showBack: boolean;
  showClose: boolean;
  canReset: boolean;
  progress: string;
  onBack: () => void;
  onClose: () => void;
  onReset: () => void;
};

export function BookingStepHeader({
  showBack,
  showClose,
  canReset,
  progress,
  onBack,
  onClose,
  onReset
}: BookingStepHeaderProps) {
  return (
    <div className="sticky top-0 z-20 border-b border-[color:var(--line)] bg-[color:var(--background)] px-4 pb-3 pt-4 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-[color:var(--foreground)] transition hover:border-[color:var(--accent-strong)]"
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : null}

          {canReset ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-[color:var(--foreground)] transition hover:border-[color:var(--accent-strong)]"
              aria-label="Сбросить запись"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <p className="text-xs uppercase tracking-[0.26em] text-[color:var(--muted-strong)]">{progress}</p>

        <div className="flex min-w-11 justify-end">
          {showClose ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-white text-[color:var(--foreground)] transition hover:border-[color:var(--accent-strong)]"
              aria-label="Закрыть запись"
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
