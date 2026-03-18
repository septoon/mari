'use client';

import type { CreatedAppointment } from '@/lib/api/contracts';
import type { BookingDraft } from '@/lib/booking/types';
import { formatBookingDateTime, formatCurrency } from '@/lib/format';

type SuccessStepProps = {
  appointment: CreatedAppointment['appointment'];
  draft: BookingDraft;
};

export function SuccessStep({
  appointment,
  draft
}: SuccessStepProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-[1.6rem] border border-[#86aa96]/40 bg-[#e3f0e8] px-5 py-5 text-[#21573b]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em]">Запись подтверждена</p>
        <h3 className="mt-3 text-2xl font-semibold">Мы сохранили ваш визит.</h3>
        <p className="mt-2 text-sm">
          Номер записи: <span className="font-medium">{appointment.externalId}</span>
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-4">
        <div className="grid gap-3 text-sm text-[color:var(--muted)]">
          <div className="flex items-start justify-between gap-3">
            <span>Услуга</span>
            <span className="text-right font-medium text-[color:var(--ink)]">
              {draft.service?.nameOnline ?? draft.service?.name}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span>Специалист</span>
            <span className="text-right font-medium text-[color:var(--ink)]">{appointment.staff.name}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span>Дата и время</span>
            <span className="text-right font-medium text-[color:var(--ink)]">{formatBookingDateTime(appointment.startAt)}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span>Клиент</span>
            <span className="text-right font-medium text-[color:var(--ink)]">
              {draft.client.name || appointment.client.name || 'Клиент'}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span>Телефон</span>
            <span className="text-right font-medium text-[color:var(--ink)]">+7 {draft.client.phone}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span>Итого</span>
            <span className="text-right font-medium text-[color:var(--ink)]">{formatCurrency(appointment.prices.finalTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
