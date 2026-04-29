'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

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
import { cn } from '@/lib/classnames';
import { FullScreenLoader } from '@/components/ui/full-screen-loader';

type BookingFlowProps = {
  flow: ReturnType<typeof useBookingFlow>;
  services: Service[];
  consentLabel: string;
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
  variant: 'page' | 'sheet';
  visibility?: {
    panel: boolean;
    schedule: boolean;
    confirmation: boolean;
  };
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
    description: 'Запись на ближайшую дату',
    actionLabel: 'Выбрать время'
  },
  time: {
    title: 'Время',
    description: 'Показываем только актуальные слоты под выбранную услугу, дату и специалиста.',
    actionLabel: 'Продолжить'
  },
  client: {
    title: 'Контакты клиента',
    description: '',
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
  visibility,
  onClose,
  onDone
}: BookingFlowProps) {
  const pathname = usePathname();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [serviceChromeCompact, setServiceChromeCompact] = useState(false);
  const servicesSummary = flow.selectedServices;
  const primaryService = servicesSummary[0] ?? null;
  const progressSteps = flow.hasCategoryStep
    ? (['category', 'service', 'staff', 'date', 'time', 'client'] as BookingStep[])
    : (['service', 'staff', 'date', 'time', 'client'] as BookingStep[]);
  const progressIndex = Math.max(progressSteps.indexOf(flow.state.step), 0) + 1;
  const permanentDiscount = flow.session.client?.discount.permanentPercent ?? null;
  const hasPermanentDiscount = Boolean(
    flow.session.authenticated && permanentDiscount && permanentDiscount > 0 && servicesSummary.length > 0
  );
  const servicesLabel = useMemo(() => {
    if (servicesSummary.length === 0) {
      return null;
    }

    if (servicesSummary.length === 1) {
      return servicesSummary[0].nameOnline ?? servicesSummary[0].name;
    }

    const firstLabel = servicesSummary[0].nameOnline ?? servicesSummary[0].name;
    return `${firstLabel} + ещё ${servicesSummary.length - 1}`;
  }, [servicesSummary]);
  const summaryPrice = useMemo(() => {
    if (servicesSummary.length === 0) {
      return null;
    }

    const totalPriceMin = servicesSummary.reduce((total, item) => total + item.priceMin, 0);
    const hasOpenEndedPrice = servicesSummary.some((item) => item.priceMax === null);
    const totalPriceMax = hasOpenEndedPrice
      ? null
      : servicesSummary.reduce((total, item) => total + (item.priceMax ?? item.priceMin), 0);

    if (!hasPermanentDiscount || flow.state.clientForm.promoCode.trim()) {
      return formatPriceRange(totalPriceMin, totalPriceMax);
    }

    return formatPriceRange(
      applyPercentDiscount(totalPriceMin, permanentDiscount!),
      totalPriceMax === null ? null : applyPercentDiscount(totalPriceMax, permanentDiscount!)
    );
  }, [flow.state.clientForm.promoCode, hasPermanentDiscount, permanentDiscount, servicesSummary]);
  const summaryItems = [
    servicesLabel
      ? {
          key: 'service',
          label: servicesSummary.length > 1 ? 'Услуги' : 'Услуга',
          value: servicesLabel,
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
    flow.state.step !== 'service' &&
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
              description: flow.state.selectedServiceIds.length > 0
                ? STEP_META.date.description
                : 'Показываем календарь по текущему графику. Для точного свободного времени потом выберите услугу.',
              actionLabel: flow.state.selectedServiceIds.length > 0
                ? flow.state.selectedSlot
                  ? 'Продолжить'
                  : STEP_META.date.actionLabel
                : 'Выбрать услугу'
            }
        : STEP_META[flow.state.step];
  const actionLabel =
    flow.state.step === 'staff'
      ? primaryService
        ? 'Выбрать дату'
        : 'Выбрать услугу'
      : meta?.actionLabel ?? 'Готово';

  useEffect(() => {
    headingRef.current?.focus();
  }, [flow.state.step]);

  useEffect(() => {
    if (flow.state.step !== 'service') {
      setServiceChromeCompact(false);
    }
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
      if (flow.state.selectedServiceIds.length === 0) {
        openServicesStep();
        return;
      }

      flow.requestStep('date');
      return;
    }

    if (flow.state.step === 'date') {
      if (flow.state.selectedServiceIds.length === 0) {
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
    (flow.state.step === 'service' && flow.state.selectedServiceIds.length === 0) ||
    (flow.state.step === 'staff' && !flow.state.selectedStaffId) ||
    (flow.state.step === 'date' && !flow.state.selectedDate) ||
    (flow.state.step === 'time' && !flow.state.selectedSlot) ||
    (flow.state.step === 'client' &&
      (!flow.session.authenticated || maintenanceMode || flow.state.loading.submit));

  const showFooter = services.length > 0 && flow.state.step !== 'overview';
  const showPrimaryAction = flow.state.step !== 'client' || flow.session.authenticated;
  const usesInnerStepScroll = flow.state.step === 'service';
  const progressLabel =
    flow.state.step === 'overview'
      ? 'Онлайн-запись'
      : flow.state.step === 'success'
        ? 'Готово'
        : `Шаг ${progressIndex} из ${progressSteps.length}`;
  const showFullScreenLoader =
    pathname !== '/booking' &&
    (flow.state.loading.slotDays || flow.state.loading.slots || flow.state.loading.submit);
  const fullScreenLoaderLabel = flow.state.loading.submit
    ? 'Создаю запись...'
      : flow.state.loading.slots
        ? 'Загружаю доступное время...'
        : 'Загружаю доступные даты...';
  const showPanel = visibility?.panel ?? true;
  const showSchedule = visibility?.schedule ?? true;
  const showConfirmation = visibility?.confirmation ?? true;
  const usesContainedLayout = variant === 'sheet' || variant === 'page';
  const currentStepHidden =
    (!showSchedule && (flow.state.step === 'date' || flow.state.step === 'time')) ||
    (!showConfirmation && flow.state.step === 'client');
  const showFooterForCurrentStep = showFooter && !currentStepHidden;

  return (
    <div
      className={cn(
        'flex min-h-full flex-col bg-(--background) text-(--ink)',
        usesContainedLayout && 'h-full min-h-0 overflow-hidden'
      )}
    >
      {showFullScreenLoader && variant !== 'page' ? (
        <FullScreenLoader
          label={fullScreenLoaderLabel}
          scope="site"
        />
      ) : null}
      {/* {showPanel ? (
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
      ) : null} */}

      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col px-4 sm:px-6',
          usesContainedLayout && 'overflow-hidden'
        )}
      >
        <div
          className={cn(
            'min-h-0 flex-1',
            usesContainedLayout && (usesInnerStepScroll ? 'overflow-hidden' : 'overflow-y-auto')
          )}
        >
          <div
            className={cn(
              usesContainedLayout ? 'flex h-full min-h-0 flex-1 flex-col pt-5' : 'pt-5'
            )}
          >
            {showPanel && showSummary ? (
              <div
                className={cn(
                  'flex flex-nowrap overflow-x-auto overflow-y-hidden overscroll-x-contain transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
                  flow.state.step === 'service' && serviceChromeCompact
                    ? 'mb-2 max-h-12 gap-1.5'
                    : 'mb-4 max-h-28 gap-2'
                )}
              >
                {summaryItems.map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => flow.requestStep(item.step)}
                    className={cn(
                      'shrink-0 whitespace-nowrap rounded-full border border-(--line) bg-(--panel) text-(--foreground) transition-all duration-300 hover:border-(--accent-strong)',
                      flow.state.step === 'service' && serviceChromeCompact
                        ? 'px-2.5 py-1 text-xs'
                        : 'px-3 py-1.5 text-sm'
                    )}
                  >
                    {item.value}
                  </button>
                ))}
                {summaryPrice ? (
                  <span
                    className={cn(
                      'shrink-0 whitespace-nowrap rounded-full border border-(--line) bg-white font-medium text-(--foreground) transition-all duration-300',
                      flow.state.step === 'service' && serviceChromeCompact
                        ? 'px-2.5 py-1 text-xs'
                        : 'px-3 py-1.5 text-sm'
                    )}
                  >
                    {summaryPrice}
                  </span>
                ) : null}
              </div>
            ) : null}

            {showPanel && meta && flow.state.step !== 'service' ? (
              <div className="mb-5">
                <h2
                  ref={headingRef}
                  tabIndex={-1}
                  className="outline-none font-serif text-3xl leading-tight text-(--ink) sm:text-4xl"
                >
                  {meta.title}
                </h2>
                {meta.description ? (
                  <p className="mt-2 text-sm leading-6 text-(--muted)">{meta.description}</p>
                ) : null}
              </div>
            ) : null}

            <div
              className={cn(
                'flex min-h-0 flex-1 flex-col',
                usesContainedLayout && (usesInnerStepScroll ? 'overflow-hidden pb-0' : 'pb-6')
              )}
            >
              {services.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-(--line) bg-(--panel) px-5 py-6 text-sm text-(--muted)">
                  Каталог услуг временно недоступен. Попробуйте обновить страницу или свяжитесь с салоном напрямую.
                </div>
              ) : null}

              {flow.state.step === 'overview' ? (
                <OverviewStep
                  serviceLabel={servicesLabel}
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
                  selectedServiceIds={flow.state.selectedServiceIds}
                  compact={serviceChromeCompact}
                  onCompactChange={setServiceChromeCompact}
                  summaryItems={summaryItems}
                  summaryPrice={summaryPrice}
                  onSummarySelect={flow.requestStep}
                  onSelect={flow.selectService}
                />
              ) : null}

              {flow.state.step === 'staff' ? (
                <StaffStep
                  specialists={flow.availableSpecialists}
                  selectedStaffId={flow.state.selectedStaffId}
                  canChooseAnyStaff={flow.canChooseAnyStaff}
                  isSlotDisabled={flow.isSlotBlockedForClient}
                  onSelect={flow.selectStaff}
                  selectedServiceIds={flow.state.selectedServiceIds}
                  onOpenCalendar={flow.openDateCalendar}
                  onSelectPreviewSlot={flow.selectPreviewSlot}
                />
              ) : null}

              {!showSchedule && (flow.state.step === 'date' || flow.state.step === 'time') ? (
                <div className="rounded-[1.5rem] border border-dashed border-(--line) bg-(--panel) px-5 py-6 text-sm text-(--muted)">
                  Блок выбора даты и времени сейчас скрыт на сайте.
                </div>
              ) : null}

              {showSchedule && flow.state.step === 'date' ? (
                <DateStep
                  slotDays={flow.state.slotDays}
                  slots={flow.state.slots}
                  selectedDate={flow.state.selectedDate}
                  selectedSlot={flow.state.selectedSlot}
                  loading={flow.state.loading.slotDays}
                  slotsLoading={flow.state.loading.slots}
                  showSlots={flow.state.selectedServiceIds.length > 0}
                  error={flow.state.errors.slotDays}
                  slotsError={flow.state.errors.slots}
                  hasBlockedSlots={flow.hasBlockedSlotsOnSelectedDate}
                  isSlotDisabled={flow.isSlotBlockedForClient}
                  onSelect={flow.selectDate}
                  onSelectSlot={flow.selectSlot}
                />
              ) : null}

              {showSchedule && flow.state.step === 'time' ? (
                <TimeStep
                  slots={flow.state.slots}
                  selectedSlot={flow.state.selectedSlot}
                  loading={flow.state.loading.slots}
                  error={flow.state.errors.slots}
                  hasBlockedSlots={flow.hasBlockedSlotsOnSelectedDate}
                  isSlotDisabled={flow.isSlotBlockedForClient}
                  onSelect={flow.selectSlot}
                />
              ) : null}

              {!showConfirmation && flow.state.step === 'client' ? (
                <div className="rounded-[1.5rem] border border-dashed border-(--line) bg-(--panel) px-5 py-6 text-sm text-(--muted)">
                  Блок подтверждения записи сейчас скрыт на сайте.
                </div>
              ) : null}

              {showConfirmation && flow.state.step === 'client' ? (
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

        {showFooterForCurrentStep ? (
          <div
            className={cn(
              'sticky bottom-0 z-20 -mx-4 mt-auto shrink-0 border-t border-(--line) bg-(--background) px-4 transition-shadow duration-300 sm:-mx-6 sm:px-6',
              usesContainedLayout
                ? 'pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-18px_40px_rgba(19,29,31,0.08)]'
                : 'pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4'
            )}
          >
            {flow.state.step === 'success' ? (
              <div className="flex w-full flex-row gap-3">
                {onDone ? (
                  <Button type="button" onClick={onDone} className="min-w-0 flex-1">
                    Готово
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant={onDone ? 'secondary' : 'primary'}
                  onClick={flow.reset}
                  className="min-w-0 flex-1"
                >
                  Записать ещё
                </Button>
              </div>
            ) : (
              <div className="flex w-full flex-row gap-3">
                {flow.previousStep ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={flow.goBack}
                    className="w-[34%] min-w-24 flex-none px-4"
                  >
                    Назад
                  </Button>
                ) : null}
                {showPrimaryAction ? (
                  <Button
                    type="button"
                    disabled={isPrimaryDisabled}
                    onClick={() => {
                      void handlePrimaryAction();
                    }}
                    className="min-w-0 flex-1"
                  >
                    {flow.state.step === 'client' && flow.state.loading.submit ? (
                      <LoadingLabel label="Создаю запись..." />
                    ) : (
                      actionLabel
                    )}
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
