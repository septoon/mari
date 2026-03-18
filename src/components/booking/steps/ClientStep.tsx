'use client';

import Link from 'next/link';
import type { ClipboardEvent } from 'react';

import { ConsentCheckbox } from '@/components/legal/consent-checkbox';
import type { BookingClientForm, BookingDraft } from '@/lib/booking/types';
import { normalizePhoneDigits, normalizePhonePaste } from '@/lib/booking/phone';
import { formatBookingDateTime, formatDuration, formatPriceRange } from '@/lib/format';

type ClientStepProps = {
  draft: BookingDraft;
  formErrors: Partial<Record<'name' | 'phone' | 'consent', string>>;
  submitError: string | null;
  consentLabel: string;
  sessionAuthenticated: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
  onChange: (patch: Partial<BookingClientForm>) => void;
};

function PhoneInput({
  value,
  onChange,
  error
}: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    onChange(normalizePhonePaste(event.clipboardData.getData('text')));
  };

  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Телефон</span>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-sm font-medium text-[color:var(--foreground)]">
          +7
        </span>
        <input
          value={value}
          onChange={(event) => onChange(normalizePhoneDigits(event.target.value))}
          onPaste={handlePaste}
          autoComplete="tel-national"
          inputMode="numeric"
          maxLength={10}
          placeholder="9780001818"
          className={`w-full rounded-[1.3rem] border bg-[color:var(--panel)] py-3.5 pl-8 pr-4 text-sm outline-none transition ${
            error ? 'border-[#d0817c] bg-[#fff1f0]' : 'border-[color:var(--line)] focus:border-[color:var(--accent-strong)]'
          }`}
        />
      </div>
      {error ? <p className="text-sm text-[#7d3a37]">{error}</p> : null}
    </label>
  );
}

export function ClientStep({
  draft,
  formErrors,
  submitError,
  consentLabel,
  sessionAuthenticated,
  maintenanceMode,
  maintenanceMessage,
  onChange
}: ClientStepProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(244,240,235,0.94),rgba(235,241,239,0.8))] px-5 py-4">
        <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted-strong)]">Детали записи</p>
        <div className="mt-4 grid gap-3 text-sm text-[color:var(--muted)]">
          <div className="flex items-start justify-between gap-3">
            <span>Услуга</span>
            <span className="text-right font-medium text-[color:var(--ink)]">
              {draft.service?.nameOnline ?? draft.service?.name ?? 'Не выбрано'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span>Специалист</span>
            <span className="text-right font-medium text-[color:var(--ink)]">
              {draft.isAnyStaff ? 'Любой специалист' : draft.staff?.name ?? 'Не выбрано'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span>Время</span>
            <span className="text-right font-medium text-[color:var(--ink)]">
              {draft.slot ? formatBookingDateTime(draft.slot.startAt) : 'Не выбрано'}
            </span>
          </div>
          {draft.service ? (
            <div className="flex items-start justify-between gap-3">
              <span>Стоимость</span>
              <span className="text-right font-medium text-[color:var(--ink)]">
                {formatPriceRange(draft.service.priceMin, draft.service.priceMax)} · {formatDuration(draft.service.durationSec)}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {!sessionAuthenticated ? (
        <div className="rounded-[1.4rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-4 text-sm text-[color:var(--muted)]">
          <p>Можно продолжить запись как гость или войти в личный кабинет.</p>
          <div className="mt-3 flex flex-wrap gap-4">
            <Link
              href="/account/login"
              className="text-[color:var(--foreground)] underline decoration-[color:var(--line-strong)] underline-offset-4"
            >
              Войти
            </Link>
            <Link
              href="/account/register"
              className="text-[color:var(--foreground)] underline decoration-[color:var(--line-strong)] underline-offset-4"
            >
              Создать кабинет
            </Link>
          </div>
        </div>
      ) : null}

      {maintenanceMode ? (
        <div className="rounded-[1.4rem] border border-[#d7b78d] bg-[#fff3e5] px-5 py-4 text-sm text-[#6f5233]">
          {maintenanceMessage || 'Сервис записи временно недоступен.'}
        </div>
      ) : null}

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Имя</span>
        <input
          value={draft.client.name}
          onChange={(event) => onChange({ name: event.target.value })}
          autoComplete="name"
          placeholder="Как к вам обращаться"
          className={`w-full rounded-[1.3rem] border bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none transition ${
            formErrors.name ? 'border-[#d0817c] bg-[#fff1f0]' : 'border-[color:var(--line)] focus:border-[color:var(--accent-strong)]'
          }`}
        />
        {formErrors.name ? <p className="text-sm text-[#7d3a37]">{formErrors.name}</p> : null}
      </label>

      <PhoneInput
        value={draft.client.phone}
        onChange={(value) => onChange({ phone: value })}
        error={formErrors.phone}
      />

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Промокод</span>
        <input
          value={draft.client.promoCode}
          onChange={(event) => onChange({ promoCode: event.target.value })}
          placeholder="Если есть"
          className="w-full rounded-[1.3rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none transition focus:border-[color:var(--accent-strong)]"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Комментарий</span>
        <textarea
          value={draft.client.comment}
          onChange={(event) => onChange({ comment: event.target.value })}
          placeholder="Комментарий к записи"
          rows={4}
          maxLength={1000}
          className="w-full rounded-[1.3rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3.5 text-sm outline-none transition focus:border-[color:var(--accent-strong)]"
        />
      </label>

      <div className="space-y-2">
        <ConsentCheckbox
          checked={draft.client.consentAccepted}
          onChange={(checked) => onChange({ consentAccepted: checked })}
          label={consentLabel}
        />
        {formErrors.consent ? <p className="text-sm text-[#7d3a37]">{formErrors.consent}</p> : null}
      </div>

      {submitError ? (
        <div className="rounded-[1.4rem] border border-[#c4847d]/35 bg-[#f5dddb] px-5 py-4 text-sm text-[#7d3a37]">
          {submitError}
        </div>
      ) : null}
    </div>
  );
}
