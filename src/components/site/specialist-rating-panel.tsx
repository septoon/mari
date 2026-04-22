'use client';

import Link from 'next/link';
import { Loader2, Star } from 'lucide-react';
import { useState } from 'react';

import { useClientSession } from '@/components/client-session-provider';
import {
  apiErrorSchema,
  buildApiOkSchema,
  submitSpecialistRatingResultSchema,
  type SpecialistCard
} from '@/lib/api/contracts';

const RATING_VALUES = [1, 2, 3, 4, 5] as const;

const formatAverage = (value: number | null) => {
  if (value === null) {
    return 'Нет оценок';
  }
  return `${value.toFixed(1)} / 5`;
};

const ratingCountLabel = (count: number) => {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} оценка`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} оценки`;
  }
  return `${count} оценок`;
};

type SpecialistRatingPanelProps = {
  specialist: Pick<SpecialistCard, 'staffId' | 'rating'>;
};

export function SpecialistRatingPanel({ specialist }: SpecialistRatingPanelProps) {
  const { session, status } = useClientSession();
  const [rating, setRating] = useState(specialist.rating);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [pendingValue, setPendingValue] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRate = async (value: number) => {
    if (!session.authenticated) {
      setErrorMessage('Войдите в кабинет клиента, чтобы поставить оценку.');
      return;
    }

    setPendingValue(value);
    setErrorMessage('');

    try {
      const response = await fetch(`/api/specialists/${specialist.staffId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value })
      });
      const payload = await response.json();
      const parsedError = apiErrorSchema.safeParse(payload);
      if (!response.ok && parsedError.success) {
        throw new Error(parsedError.data.error.message);
      }

      const parsedPayload = buildApiOkSchema(submitSpecialistRatingResultSchema).safeParse(payload);
      if (!parsedPayload.success) {
        throw new Error('Некорректный ответ сервера.');
      }

      setRating(parsedPayload.data.data.rating);
      setSelectedValue(parsedPayload.data.data.rating.submittedValue);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось сохранить оценку.');
    } finally {
      setPendingValue(null);
    }
  };

  return (
    <div className="max-w-2xl rounded-[1.75rem] border border-(--line) bg-white/82 p-5 shadow-[0_18px_50px_rgba(76,52,25,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.26em] text-(--muted-strong)">Рейтинг специалиста</p>
          <p className="mt-3 text-2xl font-semibold text-(--ink)">{formatAverage(rating.average)}</p>
          <p className="mt-2 text-sm text-(--muted)">{ratingCountLabel(rating.count)}</p>
        </div>
        <div className="rounded-full border border-(--line) bg-(--panel) px-4 py-2 text-sm text-(--muted-strong)">
          {selectedValue ? `Ваша оценка: ${selectedValue}/5` : 'Оценить специалиста'}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {RATING_VALUES.map((value) => {
          const activeValue = selectedValue ?? pendingValue;
          const filled = value <= (activeValue ?? 0);
          return (
            <button
              key={value}
              type="button"
              onClick={() => void handleRate(value)}
              disabled={status === 'loading' || pendingValue !== null}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-(--line) bg-white text-(--ink) transition hover:border-(--accent-strong) disabled:cursor-wait disabled:opacity-60"
              aria-label={`Поставить ${value} из 5`}
            >
              {pendingValue === value ? (
                <Loader2 className="h-5 w-5 animate-spin text-(--accent-strong)" />
              ) : (
                <Star
                  className={`h-5 w-5 ${filled ? 'fill-(--accent-strong) text-(--accent-strong)' : 'text-(--muted-strong)'}`}
                />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-sm leading-6 text-(--muted)">
        {session.authenticated ? (
          ''
        ) : (
          <>
            Войти в кабинет клиента: <Link href="/account/login" className="underline underline-offset-4">/account/login</Link>
          </>
        )}
      </p>

      {errorMessage ? (
        <p className="mt-3 rounded-[1.2rem] border border-[#d9b0ab] bg-[#fff3f1] px-4 py-3 text-sm text-[#9a4b43]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
