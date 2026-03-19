'use client';

import { useEffect, useMemo, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loading-indicator';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import type { Service } from '@/lib/api/contracts';
import { formatBookingDate, formatPriceRange } from '@/lib/format';
import type { BookingStep } from '@/lib/booking/types';

import { BookingStepHeader } from '@/components/booking/BookingStepHeader';
import { CategoryStep } from '@/components/booking/steps/CategoryStep';
import { ClientStep } from '@/components/booking/steps/ClientStep';
import { DateStep } from '@/components/booking/steps/DateStep';
import { OverviewStep } from '@/components/booking/steps/OverviewStep';
import { ServiceStep } from '@/components/booking/steps/ServiceStep';
import { StaffStep } from '@/components/booking/steps/StaffStep';
import { SuccessStep } from '@/components/booking/steps/SuccessStep';
import { TimeStep } from '@/components/booking/steps/TimeStep';

type BookingFlowProps = {
  flow: ReturnType<typeof useBookingFlow>;
  services: Service[];
  consentLabel: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
  variant: 'page' | 'sheet';
  onClose?: () => void;
  onDone?: () => void;
};

const STEP_META: Record<
  Exclude<BookingStep, 'overview' | 'success'>,
  { title: string; description: string; actionLabel: string }
> = {
  category: {
    title: 'Категория услуг',
    description: 'Начните с направления, чтобы быстро сузить список услуг.',
    actionLabel: 'Выбрать услугу'
  },
  service: {
    title: 'Услуга',
    description: 'Используем текущий каталог и порядок услуг без отдельного дублирующего источника.',
    actionLabel: 'Выбрать специалиста'
  },
  staff: {
    title: 'Специалист',
    description: 'Показываем только тех мастеров, которые доступны для выбранной услуги.',
    actionLabel: 'Выбрать дату'
  },
  date: {
    title: 'Дата',
    description: 'Доступны только реальные даты со слотами. Ближайшую дату предлагаем автоматически.',
    actionLabel: 'Выбрать время'
  },
  time: {
    title: 'Время',
    description: 'Показываем только актуальные слоты под выбранную услугу, дату и специалиста.',
    actionLabel: 'Продолжить'
  },
  client: {
    title: 'Контакты клиента',
    description: 'Форма использует текущие валидаторы и реальный submit в существующий API записи.',
    actionLabel: 'Записаться'
  }
};

const applyPercentDiscount = (amount: number, percent: number) =>
  Math.max(0, Math.round(amount * (1 - percent / 100) * 100) / 100);

export function BookingFlow({
  flow,
  services,
  consentLabel,
  maintenanceMode,
  maintenanceMessage,
  variant,
  onClose,
  onDone
}: BookingFlowProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const service = flow.selectedService;
  const progressSteps = flow.hasCategoryStep
    ? (['category', 'service', 'staff', 'date', 'time', 'client'] as BookingStep[])
    : (['service', 'staff', 'date', 'time', 'client'] as BookingStep[]);
  const progressIndex = Math.max(progressSteps.indexOf(flow.state.step), 0) + 1;
  const permanentDiscount = flow.session.client?.discount.permanentPercent ?? null;
  const hasPermanentDiscount = Boolean(
    flow.session.authenticated && permanentDiscount && permanentDiscount > 0 && service
  );
  const summaryPrice = useMemo(() => {
    if (!service) {
      return null;
    }

    if (!hasPermanentDiscount || flow.state.clientForm.promoCode.trim()) {
      return formatPriceRange(service.priceMin, service.priceMax);
    }

    return formatPriceRange(
      applyPercentDiscount(service.priceMin, permanentDiscount!),
      service.priceMax === null ? null : applyPercentDiscount(service.priceMax, permanentDiscount!)
    );
  }, [flow.state.clientForm.promoCode, hasPermanentDiscount, permanentDiscount, service]);
  const summaryItems = [
    service
      ? {
          key: 'service',
          label: 'Услуга',
          value: service.nameOnline ?? service.name,
          step: 'service' as BookingStep
        }
      : null,
    flow.selectedStaff || flow.state.selectedStaffId === 'any'
      ? {
          key: 'staff',
          label: 'Специалист',
          value: flow.state.selectedStaffId === 'any' ? 'Любой специалист' : flow.selectedStaff?.name ?? '',
          step: 'staff' as BookingStep
        }
      : null,
    flow.state.selectedDate
      ? {
          key: 'date',
          label: 'Дата',
          value: formatBookingDate(flow.state.selectedDate),
          step: 'date' as BookingStep
        }
      : null
  ].filter(Boolean) as Array<{ key: string; label: string; value: string; step: BookingStep }>;
  const showSummary =
    flow.state.step !== 'overview' &&
    flow.state.step !== 'staff' &&
    flow.state.step !== 'success' &&
    summaryItems.length > 0;
  const meta =
    flow.state.step === 'overview' || flow.state.step === 'success' || flow.state.step === 'staff'
      ? null
      : flow.state.step === 'service'
        ? {
            ...STEP_META.service,
            description: flow.selectedStaff
              ? 'Показываем только услуги, которые доступны у выбранного мастера.'
              : STEP_META.service.description,
            actionLabel: flow.state.selectedStaffId ? 'Выбрать дату' : STEP_META.service.actionLabel
          }
        : flow.state.step === 'date'
          ? {
              ...STEP_META.date,
              description: flow.state.selectedServiceId
                ? STEP_META.date.description
                : 'Показываем календарь по текущему графику. Для точного свободного времени потом выберите услугу.',
              actionLabel: flow.state.selectedServiceId
                ? flow.state.selectedSlot
                  ? 'Продолжить'
                  : STEP_META.date.actionLabel
                : 'Выбрать услугу'
            }
        : STEP_META[flow.state.step];
  const actionLabel =
    flow.state.step === 'staff'
      ? flow.selectedService
        ? 'Выбрать дату'
        : 'Выбрать услугу'
      : meta?.actionLabel ?? 'Готово';

  useEffect(() => {
    headingRef.current?.focus();
  }, [flow.state.step]);

  const openServicesStep = () => {
    flow.requestStep('service');
  };

  const openStaffStep = () => {
    flow.requestStep('staff');
  };

  const openDateStep = () => {
    flow.openDateCalendar();
  };

  const handlePrimaryAction = async () => {
    if (flow.state.step === 'overview') {
      openServicesStep();
      return;
    }

    if (flow.state.step === 'category') {
      flow.requestStep('service');
      return;
    }

    if (flow.state.step === 'service') {
      if (flow.state.selectedStaffId) {
        flow.requestStep('date');
        return;
      }

      flow.requestStep('staff');
      return;
    }

    if (flow.state.step === 'staff') {
      if (!flow.state.selectedServiceId) {
        openServicesStep();
        return;
      }

      flow.requestStep('date');
      return;
    }

    if (flow.state.step === 'date') {
      if (!flow.state.selectedServiceId) {
        openServicesStep();
        return;
      }

      if (flow.state.selectedSlot) {
        flow.requestStep('client');
        return;
      }

      flow.requestStep('time');
      return;
    }

    if (flow.state.step === 'time') {
      flow.requestStep('client');
      return;
    }

    if (flow.state.step === 'client') {
      await flow.submit();
      return;
    }

    onDone?.();
  };

  const isPrimaryDisabled =
    flow.state.step === 'overview' ||
    (flow.state.step === 'category' && !flow.state.selectedCategoryId) ||
    (flow.state.step === 'service' && !flow.state.selectedServiceId) ||
    (flow.state.step === 'staff' && !flow.state.selectedStaffId) ||
    (flow.state.step === 'date' && !flow.state.selectedDate) ||
    (flow.state.step === 'time' && !flow.state.selectedSlot) ||
    (flow.state.step === 'client' && (maintenanceMode || flow.state.loading.submit));

  const showFooter = services.length > 0 && flow.state.step !== 'overview';
  const progressLabel =
    flow.state.step === 'overview'
      ? 'Онлайн-запись'
      : flow.state.step === 'success'
        ? 'Готово'
        : `Шаг ${progressIndex} из ${progressSteps.length}`;

  return (
    <div
      className={`flex min-h-full flex-col bg-[color:var(--background)] text-[color:var(--ink)] ${
        variant === 'sheet' ? 'h-full min-h-0 overflow-hidden' : ''
      }`}
    >
      <BookingStepHeader
        showBack={Boolean(flow.previousStep)}
        showClose={variant === 'sheet' && Boolean(onClose)}
        canReset={variant === 'page' && flow.isDirty}
        progress={progressLabel}
        onBack={() => {
          flow.goBack();
        }}
        onClose={() => {
          onClose?.();
        }}
        onReset={() => {
          flow.reset();
        }}
      />

      <div
        className={`flex min-h-0 flex-1 flex-col px-4 sm:px-6 ${
          variant === 'sheet' ? 'overflow-hidden' : ''
        }`}
      >
        <div className={`min-h-0 flex-1 ${variant === 'sheet' ? 'overflow-y-auto' : ''}`}>
          <div className={`${variant === 'sheet' ? 'flex min-h-full flex-col pt-5' : 'pt-5'}`}>
            {showSummary ? (
              <div className="mb-4 flex flex-wrap gap-2">
                {summaryItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => flow.requestStep(item.step)}
                    className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel)] px-3 py-1.5 text-sm text-[color:var(--foreground)] transition hover:border-[color:var(--accent-strong)]"
                  >
                    {item.label}: {item.value}
                  </button>
                ))}
                {summaryPrice ? (
                  <span className="rounded-full border border-[color:var(--line)] bg-white px-3 py-1.5 text-sm font-medium text-[color:var(--foreground)]">
                    {summaryPrice}
                  </span>
                ) : null}
              </div>
            ) : null}

            {meta ? (
              <div className="mb-5">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="outline-none font-serif text-3xl leading-tight text-[color:var(--ink)] sm:text-4xl"
                >
                  {meta.title}
                </h2>
                {meta.description ? (
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{meta.description}</p>
                ) : null}
              </div>
            ) : null}

            <div className={`flex min-h-0 flex-1 flex-col ${variant === 'sheet' ? 'pb-6' : ''}`}>
              {services.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 text-sm text-[color:var(--muted)]">
                  Каталог услуг временно недоступен. Попробуйте обновить страницу или свяжитесь с салоном напрямую.
                </div>
              ) : null}

              {flow.state.step === 'overview' ? (
                <OverviewStep
                  serviceLabel={flow.selectedService?.nameOnline ?? flow.selectedService?.name ?? null}
                  staffLabel={flow.state.selectedStaffId === 'any' ? 'Любой специалист' : flow.selectedStaff?.name ?? null}
                  dateLabel={flow.state.selectedDate ? formatBookingDate(flow.state.selectedDate) : null}
                  onOpenServices={openServicesStep}
                  onOpenStaff={openStaffStep}
                  onOpenDate={openDateStep}
                />
              ) : null}

              {flow.state.step === 'category' ? (
                <CategoryStep
                  categories={flow.categories}
                  selectedCategoryId={flow.state.selectedCategoryId}
                  onSelect={flow.selectCategory}
                />
              ) : null}

              {flow.state.step === 'service' ? (
                <ServiceStep
                  services={flow.availableServices}
                  selectedCategoryId={flow.state.selectedCategoryId}
                  selectedServiceId={flow.state.selectedServiceId}
                  onSelect={flow.selectService}
                  variant={variant}
                />
              ) : null}

              {flow.state.step === 'staff' ? (
            <StaffStep
              specialists={flow.availableSpecialists}
              selectedStaffId={flow.state.selectedStaffId}
              canChooseAnyStaff={flow.canChooseAnyStaff}
              onSelect={flow.selectStaff}
              selectedServiceId={flow.state.selectedServiceId}
              onOpenCalendar={flow.openDateCalendar}
              onSelectPreviewSlot={flow.selectPreviewSlot}
            />
          ) : null}

              {flow.state.step === 'date' ? (
                <DateStep
                  slotDays={flow.state.slotDays}
                  slots={flow.state.slots}
                  selectedDate={flow.state.selectedDate}
                  selectedSlot={flow.state.selectedSlot}
                  loading={flow.state.loading.slotDays}
                  slotsLoading={flow.state.loading.slots}
                  error={flow.state.errors.slotDays}
                  slotsError={flow.state.errors.slots}
                  onSelect={flow.selectDate}
                  onSelectSlot={flow.selectSlot}
                />
              ) : null}

              {flow.state.step === 'time' ? (
                <TimeStep
                  slots={flow.state.slots}
                  selectedSlot={flow.state.selectedSlot}
                  loading={flow.state.loading.slots}
                  error={flow.state.errors.slots}
                  onSelect={flow.selectSlot}
                />
              ) : null}

              {flow.state.step === 'client' ? (
                <ClientStep
                  draft={flow.draft}
                  formErrors={flow.state.errors.form}
                  submitError={flow.state.errors.submit}
                  consentLabel={consentLabel}
                  sessionAuthenticated={flow.session.authenticated}
                  maintenanceMode={maintenanceMode}
                  maintenanceMessage={maintenanceMessage}
                  onChange={flow.updateClientForm}
                />
              ) : null}

              {flow.state.step === 'success' && flow.state.successAppointment ? (
                <SuccessStep
                  appointment={flow.state.successAppointment}
                  draft={flow.draft}
                />
              ) : null}
            </div>
          </div>
        </div>

        {showFooter ? (
          <div
            className={`z-20 mt-auto shrink-0 border-t border-[color:var(--line)] bg-[color:var(--background)] ${
              variant === 'sheet'
                ? 'pb-4 pt-4 shadow-[0_-18px_40px_rgba(19,29,31,0.06)]'
                : 'sticky bottom-0 pb-4 pt-4'
            }`}
          >
            {flow.state.step === 'success' ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                {onDone ? (
                  <Button type="button" onClick={onDone} className="sm:flex-1">
                    Готово
                  </Button>
                ) : null}
                <Button type="button" variant={onDone ? 'secondary' : 'primary'} onClick={flow.reset} className="sm:flex-1">
                  Записать ещё
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                {flow.previousStep ? (
                  <Button type="button" variant="secondary" onClick={flow.goBack} className="sm:w-auto">
                    Назад
                  </Button>
                ) : null}
                <Button
                  type="button"
                  disabled={isPrimaryDisabled}
                  onClick={() => {
                    void handlePrimaryAction();
                  }}
                  className="sm:flex-1"
                >
                  {flow.state.step === 'client' && flow.state.loading.submit ? (
                    <LoadingLabel label="Создаю запись..." />
                  ) : (
                    actionLabel
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
