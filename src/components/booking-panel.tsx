'use client';

import {
  CalendarDays,
  Check,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  X
} from 'lucide-react';
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
  type FormEvent
} from 'react';

import {
  reachYandexMetrikaGoal,
  yandexMetrikaGoals
} from '@/components/analytics/yandex-metrika-goals';
import { useClientSession } from '@/components/client-session-provider';
import { ButtonLink } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loading-indicator';
import { readApiOk } from '@/lib/api/browser';
import {
  appointmentCreatedSchema,
  slotsResultSchema,
  type CreatedAppointment,
  type Service,
  type SlotsResult,
  type SpecialistCard
} from '@/lib/api/contracts';
import {
  formatBookingDate,
  formatBookingDateTime,
  formatCurrency,
  formatDuration,
  formatInputDate,
  formatPriceRange,
  formatTime,
  weekdayLabel
} from '@/lib/format';

type BookingPanelProps = {
  services: Service[];
  specialists: SpecialistCard[];
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
};

type SelectedSlot = {
  staffId: string;
  staffName: string;
  startAt: string;
  endAt: string;
};

const BOOKING_CART_STORAGE_KEY = 'mari.booking.cart.service-ids';
const QUICK_PICK_DAYS = 14;
const calendarDayNumberFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric' });
const calendarMonthShortFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'short' });

const getLocalDate = (offsetDays = 0) => {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return formatInputDate(value);
};

const addLocalDays = (value: string, days: number) => {
  const next = new Date(`${value}T00:00:00`);
  next.setDate(next.getDate() + days);
  return formatInputDate(next);
};

const parseCalendarDate = (value: string) => new Date(`${value}T00:00:00`);
const formatCalendarDayNumber = (value: string) => calendarDayNumberFormatter.format(parseCalendarDate(value));
const formatCalendarMonthShort = (value: string) =>
  calendarMonthShortFormatter.format(parseCalendarDate(value)).replace('.', '');

const applyPercentDiscount = (amount: number, percent: number) =>
  Math.max(0, Math.round(amount * (1 - percent / 100) * 100) / 100);

export function BookingPanel({
  services,
  specialists,
  maintenanceMode,
  maintenanceMessage
}: BookingPanelProps) {
  const { session } = useClientSession();
  const [minBookingDate] = useState(() => getLocalDate(0));
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState('any');
  const [selectedDate, setSelectedDate] = useState(getLocalDate(1));
  const [promoCode, setPromoCode] = useState('');
  const [comment, setComment] = useState('');
  const [slots, setSlots] = useState<SlotsResult | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState<CreatedAppointment['appointment'] | null>(null);
  const [serviceQuery, setServiceQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [catalogOpen, setCatalogOpen] = useState(true);
  const [cartReady, setCartReady] = useState(false);

  const deferredServiceQuery = useDeferredValue(serviceQuery.trim().toLowerCase());
  const serviceIdsKey = selectedServiceIds.join(',');
  const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id));
  const serviceCategories = Array.from(
    new Map(services.map((service) => [service.category.id, service.category.name])).entries()
  ).map(([id, name]) => ({ id, name }));
  const filteredServices = services.filter((service) => {
    const categoryOk = selectedCategoryId === 'all' || service.category.id === selectedCategoryId;
    const label = `${service.name} ${service.nameOnline ?? ''} ${service.category.name}`.toLowerCase();
    const queryOk = !deferredServiceQuery || label.includes(deferredServiceQuery);
    return categoryOk && queryOk;
  });
  const visibleServices = filteredServices.slice(0, 12);
  const availableSpecialists = specialists.filter((specialist) =>
    selectedServiceIds.length === 0
      ? true
      : selectedServiceIds.every((serviceId) =>
          specialist.services.some((service) => service.id === serviceId)
        )
  );
  const totalMin = selectedServices.reduce((sum, service) => sum + service.priceMin, 0);
  const totalMax = selectedServices.reduce(
    (sum, service) => sum + (service.priceMax ?? service.priceMin),
    0
  );
  const totalDurationSec = selectedServices.reduce((sum, service) => sum + service.durationSec, 0);
  const permanentDiscountPercent = session.client?.discount.permanentPercent ?? null;
  const hasPermanentDiscount = Boolean(
    session.authenticated && permanentDiscountPercent && permanentDiscountPercent > 0
  );
  const discountedMin = hasPermanentDiscount
    ? applyPercentDiscount(totalMin, permanentDiscountPercent!)
    : totalMin;
  const discountedMax = hasPermanentDiscount
    ? applyPercentDiscount(totalMax, permanentDiscountPercent!)
    : totalMax;
  const quickPickDates = Array.from({ length: QUICK_PICK_DAYS }, (_, index) =>
    addLocalDays(minBookingDate, index)
  );
  const flatSlotTimes =
    slots?.results.flatMap((group) => group.slots.map((slot) => slot.startAt)) ?? [];
  const firstAvailableSlot = flatSlotTimes[0] ?? null;
  const slotCount = slots?.results.reduce((sum, group) => sum + group.slots.length, 0) ?? 0;
  const hasSelectedServices = selectedServices.length > 0;
  const hasAvailableSlots = Boolean(slots?.results.some((group) => group.slots.length > 0));
  const summaryTotal = hasSelectedServices
    ? formatPriceRange(
        promoCode.trim() ? totalMin : discountedMin,
        promoCode.trim() ? totalMax : discountedMax
      )
    : '0 ₽';
  const selectedServicesLabel = hasSelectedServices
    ? selectedServices.map((service) => service.nameOnline ?? service.name).join(' · ')
    : 'Услуги пока не выбраны';

  const requestSlots = useCallback(async () => {
    if (!selectedServiceIds.length || !selectedDate) {
      startTransition(() => {
        setSlots(null);
      });
      return;
    }

    setLoadingSlots(true);
    setErrorMessage(null);

    try {
      const searchParams = new URLSearchParams({
        date: selectedDate,
        serviceIds: selectedServiceIds.join(','),
        anyStaff: String(selectedStaffId === 'any')
      });

      if (selectedStaffId !== 'any') {
        searchParams.set('staffId', selectedStaffId);
      }

      const response = await fetch(`/api/slots?${searchParams.toString()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      const payload = await readApiOk(response, slotsResultSchema);

      startTransition(() => {
        setSlots(payload);
        setSelectedSlot((current) => {
          if (!current) {
            return null;
          }

          const exists = payload.results.some(
            (group) =>
              group.staffId === current.staffId &&
              group.slots.some((slot) => slot.startAt === current.startAt)
          );
          return exists ? current : null;
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить свободные слоты';
      startTransition(() => {
        setSlots(null);
        setSelectedSlot(null);
        setErrorMessage(message);
      });
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedDate, selectedServiceIds, selectedStaffId]);

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(BOOKING_CART_STORAGE_KEY);
      if (!rawValue) {
        return;
      }

      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) {
        return;
      }

      const persistedIds = parsed.filter((value): value is string => typeof value === 'string');
      if (persistedIds.length) {
        setSelectedServiceIds(persistedIds);
      }
    } catch (error) {
      console.error('[BOOKING_CART_RESTORE_FAILED]', error);
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    const validServiceIds = new Set(services.map((service) => service.id));
    const nextIds = selectedServiceIds.filter((serviceId) => validServiceIds.has(serviceId));

    if (nextIds.length !== selectedServiceIds.length) {
      setSelectedServiceIds(nextIds);
    }
  }, [cartReady, selectedServiceIds, services]);

  useEffect(() => {
    if (!cartReady) {
      return;
    }

    if (selectedServiceIds.length === 0) {
      window.localStorage.removeItem(BOOKING_CART_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(BOOKING_CART_STORAGE_KEY, JSON.stringify(selectedServiceIds));
  }, [cartReady, selectedServiceIds]);

  useEffect(() => {
    if (
      selectedStaffId !== 'any' &&
      !availableSpecialists.some((item) => item.staffId === selectedStaffId)
    ) {
      setSelectedStaffId('any');
    }
  }, [availableSpecialists, selectedStaffId]);

  useEffect(() => {
    setSelectedSlot(null);
    void requestSlots();
  }, [requestSlots, serviceIdsKey]);

  useEffect(() => {
    const handleServicePicked = (event: Event) => {
      const detail = (event as CustomEvent<{ serviceId?: string }>).detail;
      if (!detail?.serviceId) {
        return;
      }

      setSelectedServiceIds((current) =>
        current.includes(detail.serviceId as string)
          ? current
          : [...current, detail.serviceId as string]
      );
      setCatalogOpen(true);
      setSuccess(null);
      setErrorMessage(null);
    };

    window.addEventListener('mari:add-service', handleServicePicked);
    return () => window.removeEventListener('mari:add-service', handleServicePicked);
  }, []);

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((item) => item !== serviceId)
        : [...current, serviceId]
    );
    setSuccess(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedServiceIds.length) {
      setErrorMessage('Добавьте хотя бы одну услугу в корзину.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Выберите свободный слот.');
      return;
    }

    if (!session.authenticated) {
      setErrorMessage('Чтобы завершить запись, войдите в личный кабинет.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceIds: selectedServiceIds,
          staffId: selectedStaffId === 'any' ? undefined : selectedStaffId,
          anyStaff: selectedStaffId === 'any',
          startAt: selectedSlot.startAt,
          comment: comment.trim() || undefined,
          promoCode: promoCode.trim() || undefined
        })
      });

      const payload = await readApiOk(response, appointmentCreatedSchema);
      reachYandexMetrikaGoal(yandexMetrikaGoals.bookingCreated, {
        order_price: payload.appointment.prices.finalTotal,
        currency: 'RUB',
        services_count: payload.appointment.services.length,
        specialist_name: payload.appointment.staff.name
      });

      startTransition(() => {
        setSelectedServiceIds([]);
        setSuccess(payload.appointment);
        setComment('');
        setPromoCode('');
        setSelectedSlot(null);
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Не удалось создать запись');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="booking"
      className="overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-[linear-gradient(135deg,rgba(11,62,69,0.96),rgba(16,83,91,0.92))] p-4 text-white shadow-[0_35px_100px_rgba(7,33,38,0.28)] sm:p-6 lg:p-7"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.16fr)_minmax(21rem,0.84fr)] xl:items-start">
        <div className="min-w-0 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <p className="rounded-full border border-white/18 bg-white/8 px-4 py-2 text-xs uppercase tracking-[0.32em] text-white/78">
              Онлайн-запись
            </p>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm text-white/78">
              <ShieldCheck className="h-4 w-4" />
              Свободное время онлайн
            </p>
          </div>

          <div className="max-w-3xl">
            <h2 className="font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
              Соберите визит без хаоса.
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/76 sm:text-base">
              Добавьте услуги, выберите мастера и слот, затем подтвердите запись. Вся форма теперь
              работает как единый поток и не разваливается на мобильных и широких экранах.
            </p>
          </div>

          {maintenanceMode ? (
            <div className="rounded-[1.4rem] border border-white/15 bg-white/10 px-5 py-4 text-sm text-white/80">
              {maintenanceMessage || 'Сервис временно на паузе. Пожалуйста, попробуйте чуть позже.'}
            </div>
          ) : null}

          <div className="rounded-[1.65rem] border border-white/14 bg-white/8 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/58">
                  <ShoppingBag className="h-4 w-4" />
                  Корзина услуг
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/72">
                  Выбирайте услуги в каталоге ниже. Корзина, длительность и итоговая стоимость
                  обновляются сразу.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCatalogOpen((value) => !value)}
                className="rounded-full border border-white/14 bg-white/10 px-4 py-2.5 text-sm text-white/82 transition hover:bg-white/14"
              >
                {catalogOpen ? 'Скрыть каталог' : 'Показать каталог'}
              </button>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)]">
              <div className="min-w-0 rounded-[1.35rem] border border-white/10 bg-[#f7f3ed] p-4 text-[color:var(--ink)]">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">
                    В корзине
                  </p>
                  <span className="text-sm text-[color:var(--ink-muted)]">
                    {selectedServices.length} поз.
                  </span>
                </div>

                {hasSelectedServices ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {selectedServices.map((service) => (
                      <div
                        key={service.id}
                        className="flex min-w-0 items-start justify-between gap-3 rounded-[1.2rem] border border-[color:var(--line)] bg-white px-4 py-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[color:var(--foreground)]">
                            {service.nameOnline ?? service.name}
                          </p>
                          <p className="mt-1 text-xs text-[color:var(--ink-muted)]">
                            {formatDuration(service.durationSec)} ·{' '}
                            {formatPriceRange(service.priceMin, service.priceMax)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleService(service.id)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] text-[color:var(--ink-muted)] transition hover:border-[color:var(--ink)] hover:text-[color:var(--ink)]"
                          aria-label={`Удалить ${service.nameOnline ?? service.name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-[1.2rem] border border-dashed border-[color:var(--line)] bg-white/70 px-4 py-5 text-sm text-[color:var(--ink-muted)]">
                    Корзина пока пустая. Добавьте одну или несколько услуг ниже.
                  </div>
                )}
              </div>

              <div className="rounded-[1.35rem] border border-white/10 bg-white/6 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/58">Сводка корзины</p>
                <div className="mt-4 space-y-3 text-sm text-white/82">
                  <div className="flex items-center justify-between gap-4">
                    <span>Услуги</span>
                    <span>{selectedServices.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Длительность</span>
                    <span>
                      {hasSelectedServices ? formatDuration(totalDurationSec) : 'Пока не выбрано'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Бюджет</span>
                    <span>
                      {hasSelectedServices
                        ? formatPriceRange(totalMin, totalMax)
                        : 'Пока не выбрано'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Слот</span>
                    <span>{selectedSlot ? formatTime(selectedSlot.startAt) : 'Не выбран'}</span>
                  </div>
                  {hasPermanentDiscount ? (
                    <div className="rounded-[1.1rem] border border-[#f0d78b]/35 bg-[#fff7dd] px-4 py-3 text-sm text-[#73571d]">
                      Постоянная скидка:{' '}
                      <span className="font-semibold">-{permanentDiscountPercent}%</span>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {catalogOpen ? (
              <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/6 p-4">
                <div className="grid gap-3">
                  <label className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                    <input
                      value={serviceQuery}
                      onChange={(event) => setServiceQuery(event.target.value)}
                      placeholder="Поиск услуги"
                      className="w-full rounded-full border border-white/14 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/36 focus:border-white/28"
                    />
                  </label>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId('all')}
                      className={`rounded-full border px-4 py-2.5 text-sm transition ${
                        selectedCategoryId === 'all'
                          ? 'border-white bg-white text-[color:var(--ink)]'
                          : 'border-white/14 bg-white/8 text-white/78 hover:bg-white/12'
                      }`}
                    >
                      Все
                    </button>
                    {serviceCategories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(category.id)}
                        className={`rounded-full border px-4 py-2.5 text-sm transition ${
                          selectedCategoryId === category.id
                            ? 'border-white bg-white text-[color:var(--ink)]'
                            : 'border-white/14 bg-white/8 text-white/78 hover:bg-white/12'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                  {services.length === 0 ? (
                    <div className="rounded-[1.2rem] border border-dashed border-white/18 px-4 py-5 text-sm text-white/70">
                      Список услуг обновляется. Если нужен быстрый подбор, позвоните нам.
                    </div>
                  ) : visibleServices.length ? (
                    visibleServices.map((service) => {
                      const active = selectedServiceIds.includes(service.id);

                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.id)}
                          className={`flex h-full min-w-0 rounded-[1.2rem] border px-4 py-4 text-left transition ${
                            active
                              ? 'border-white/28 bg-white text-[color:var(--ink)]'
                              : 'border-white/12 bg-white/6 text-white/82 hover:bg-white/12'
                          }`}
                        >
                          <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                            <div className="min-w-0">
                              <span className="block text-xs uppercase tracking-[0.22em] opacity-62">
                                {service.category.name}
                              </span>
                              <span className="mt-2 block text-sm font-medium">
                                {service.nameOnline ?? service.name}
                              </span>
                              <span
                                className={`mt-2 block text-xs ${
                                  active ? 'text-[color:var(--ink-muted)]' : 'text-white/58'
                                }`}
                              >
                                {formatDuration(service.durationSec)} ·{' '}
                                {formatPriceRange(service.priceMin, service.priceMax)}
                              </span>
                            </div>
                            <span
                              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                                active
                                  ? 'border-[color:var(--ink)] bg-[color:var(--ink)] text-white'
                                  : 'border-white/18 text-white/78'
                              }`}
                            >
                              {active ? <Check className="h-4 w-4" /> : '+'}
                            </span>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-[1.2rem] border border-dashed border-white/18 px-4 py-5 text-sm text-white/70">
                      По текущему фильтру услуги не найдены.
                    </div>
                  )}
                </div>

                {filteredServices.length > visibleServices.length ? (
                  <p className="mt-3 text-xs text-white/55">
                    Показаны первые {visibleServices.length} услуг из {filteredServices.length}.
                    Уточните поиск или категорию.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="min-w-0 rounded-[1.55rem] border border-white/14 bg-white/8 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/58">
                    Когда и к кому
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Выберите дату из ближайших двух недель или укажите ее вручную.
                  </p>
                </div>
                <div className="rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] text-white/56">
                  14 дней вперед
                </div>
              </div>

              {!hasSelectedServices ? (
                <div className="mt-5 rounded-[1.2rem] border border-dashed border-white/18 px-4 py-5 text-sm text-white/70">
                  Сначала добавьте услуги, затем выберите дату и мастера.
                </div>
              ) : (
                <div className="mt-5 grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
                  {quickPickDates.map((date) => {
                    const active = date === selectedDate;

                    return (
                      <button
                        key={date}
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        aria-pressed={active}
                        className={`min-w-0 rounded-[1.1rem] border px-3 py-3 text-left transition ${
                          active
                            ? 'border-white bg-white text-[color:var(--ink)] shadow-[0_14px_32px_rgba(6,32,36,0.18)]'
                            : 'border-white/14 bg-white/6 text-white/84 hover:bg-white/12'
                        }`}
                      >
                        <span
                          className={`block text-[10px] uppercase tracking-[0.2em] ${
                            active ? 'text-[color:var(--ink-muted)]' : 'text-white/56'
                          }`}
                        >
                          {weekdayLabel(date).replace('.', '')}
                        </span>
                        <span className="mt-2 block text-base font-semibold leading-none">
                          {formatCalendarDayNumber(date)}
                        </span>
                        <span
                          className={`mt-1 block text-xs capitalize ${
                            active ? 'text-[color:var(--ink-muted)]' : 'text-white/58'
                          }`}
                        >
                          {formatCalendarMonthShort(date)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.24em] text-white/58">Мастер</span>
                  <select
                    value={selectedStaffId}
                    onChange={(event) => setSelectedStaffId(event.target.value)}
                    className="w-full rounded-[1.05rem] border border-white/16 bg-white/8 px-4 py-3 text-sm text-white outline-none transition focus:border-white/30"
                  >
                    <option value="any">Любой доступный мастер</option>
                    {availableSpecialists.map((specialist) => (
                      <option key={specialist.staffId} value={specialist.staffId}>
                        {specialist.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.24em] text-white/58">
                    Выбрать дату вручную
                  </span>
                  <input
                    type="date"
                    min={minBookingDate}
                    value={selectedDate}
                    onChange={(event) => setSelectedDate(event.target.value)}
                    className="w-full rounded-[1.05rem] border border-white/16 bg-white/8 px-4 py-3 text-sm text-white outline-none transition [color-scheme:dark] focus:border-white/30"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-[1.2rem] border border-white/12 bg-white/8 px-4 py-4 text-sm text-white/80">
                <div className="inline-flex items-center gap-2 text-white/60">
                  <CalendarDays className="h-4 w-4" />
                  {weekdayLabel(selectedDate)}
                </div>
                <p className="mt-2 text-base font-medium text-white">
                  {formatBookingDate(selectedDate)}
                </p>
                <p className="mt-1 text-xs leading-6 text-white/58">
                  {!hasSelectedServices
                    ? 'Сначала выберите услуги'
                    : loadingSlots
                      ? 'Проверяем доступность'
                      : slotCount > 0
                        ? firstAvailableSlot
                          ? `Первое окно с ${formatTime(firstAvailableSlot)}`
                          : `Окон: ${slotCount}`
                        : 'Свободных окон на этот день нет'}
                </p>
              </div>
            </div>

            <div className="min-w-0 rounded-[1.55rem] border border-white/14 bg-white/8 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/58">
                    Свободное время
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    Показываем только слоты, подходящие под состав услуг и выбранную дату.
                  </p>
                </div>
                {loadingSlots ? (
                  <LoadingLabel
                    label="Обновляю..."
                    size="sm"
                    className="text-sm text-white/60"
                    spinnerClassName="text-white/70"
                  />
                ) : null}
              </div>

              <div className="mt-5 space-y-4">
                {!hasSelectedServices ? (
                  <div className="rounded-[1.2rem] border border-dashed border-white/18 px-4 py-5 text-sm text-white/70">
                    Сначала добавьте услуги в корзину.
                  </div>
                ) : hasAvailableSlots && slots ? (
                  slots.results.map((group) => (
                    <div
                      key={group.staffId}
                      className="rounded-[1.25rem] border border-white/10 bg-white/5 p-3 sm:p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.24em] text-white/56">
                          {group.staffName}
                        </p>
                        <span className="text-[11px] text-white/45">{group.slots.length} окон</span>
                      </div>

                      {group.slots.length ? (
                        <div className="mt-3 grid gap-2 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                          {group.slots.map((slot) => {
                            const active =
                              selectedSlot?.staffId === group.staffId &&
                              selectedSlot?.startAt === slot.startAt;

                            return (
                              <button
                                key={`${group.staffId}:${slot.startAt}`}
                                type="button"
                                onClick={() =>
                                  setSelectedSlot({
                                    staffId: group.staffId,
                                    staffName: group.staffName,
                                    startAt: slot.startAt,
                                    endAt: slot.endAt
                                  })
                                }
                                className={`min-w-0 rounded-[1rem] border px-3 py-3 text-[15px] leading-none tabular-nums transition ${
                                  active
                                    ? 'border-white bg-white text-[color:var(--ink)] shadow-[0_10px_24px_rgba(7,33,38,0.16)]'
                                    : 'border-white/14 bg-white/4 text-white/84 hover:bg-white/12'
                                }`}
                              >
                                <span className="block text-center font-medium">
                                  {formatTime(slot.startAt)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="mt-3 rounded-[1rem] border border-white/12 px-4 py-3 text-sm text-white/44">
                          Нет окон
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-white/18 px-4 py-5 text-sm text-white/70">
                    На выбранную дату свободных окон пока нет.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-w-0 space-y-5 rounded-[1.75rem] bg-white p-5 text-[color:var(--ink)] shadow-[0_25px_70px_rgba(7,33,38,0.22)] sm:p-6 xl:sticky xl:top-24 xl:self-start"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--ink-muted)]">
              Подтверждение
            </p>
            <h3 className="mt-3 font-serif text-3xl">Подтверждение визита.</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--ink-muted)]">
              {session.authenticated
                ? `Записываем как ${session.client?.name || session.client?.phoneE164}.`
                : 'Чтобы завершить запись, сначала войдите в личный кабинет.'}
            </p>
          </div>

          {!session.authenticated ? (
            <div className="rounded-[1.35rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(244,240,235,0.94),rgba(235,241,239,0.8))] px-5 py-5">
              <p className="text-sm leading-7 text-[color:var(--ink-muted)]">
                Чтобы подтвердить выбранные услуги и время, войдите в личный кабинет или создайте
                его за пару минут.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <ButtonLink href="/account/login">Войти</ButtonLink>
                <ButtonLink href="/account/register" variant="secondary">
                  Создать кабинет
                </ButtonLink>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.3rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-4 text-sm text-[color:var(--ink-muted)]">
              <div className="inline-flex items-center gap-2 text-[color:var(--ink)]">
                <UserRound className="h-4 w-4" />
                Ваш профиль
              </div>
              <p className="mt-2">
                {session.client?.name || 'Имя пока не заполнено'} · {session.client?.phoneE164}
              </p>
              {hasPermanentDiscount ? (
                <div className="mt-3 rounded-2xl border border-[#f0d78b] bg-[#fff8df] px-4 py-3 text-sm text-[#7d6120]">
                  Ваша постоянная скидка:{' '}
                  <span className="font-semibold">{permanentDiscountPercent}%</span>. Она применяется
                  автоматически, пока вы не используете промокод.
                </div>
              ) : null}
            </div>
          )}

          {session.authenticated ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">
                  Промокод
                </span>
                <input
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  placeholder="Если есть"
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--ink)]"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">
                  Комментарий
                </span>
                <input
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Например: удобно после 18:00"
                  className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3 text-sm outline-none transition focus:border-[color:var(--ink)]"
                />
              </label>
            </div>
          ) : null}

          <div className="rounded-[1.35rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(244,240,235,0.94),rgba(235,241,239,0.8))] px-5 py-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">Итог</p>
            <div className="mt-4 grid gap-4 text-sm text-[color:var(--ink-muted)]">
              <div className="rounded-[1.1rem] border border-white/50 bg-white/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
                  Услуги
                </p>
                <p className="mt-2 leading-6 text-[color:var(--ink)]">{selectedServicesLabel}</p>
              </div>

              <div className="rounded-[1.1rem] border border-white/50 bg-white/60 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
                  Время
                </p>
                <p className="mt-2 leading-6 text-[color:var(--ink)]">
                  {selectedSlot
                    ? `${selectedSlot.staffName} · ${formatBookingDateTime(selectedSlot.startAt)}`
                    : 'Слот пока не выбран'}
                </p>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-3 rounded-[1.1rem] border border-white/50 bg-white/60 px-4 py-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">
                    К оплате
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[color:var(--ink)]">
                    {summaryTotal}
                  </p>
                </div>

                {hasPermanentDiscount ? (
                  <div className="text-right text-xs leading-5 text-[color:var(--ink-muted)]">
                    <p>
                      Постоянная скидка:{' '}
                      <span className="font-semibold text-[color:var(--ink)]">
                        -{permanentDiscountPercent}%
                      </span>
                    </p>
                    {!promoCode.trim() ? (
                      <p>Без скидки: {formatPriceRange(totalMin, totalMax)}</p>
                    ) : (
                      <p>Если промокод сработает, он заменит постоянную скидку.</p>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-[1.2rem] border border-[#c4847d]/35 bg-[#f5dddb] px-4 py-3 text-sm text-[#7d3a37]">
              {errorMessage}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-[1.2rem] border border-[#86aa96]/40 bg-[#e3f0e8] px-4 py-4 text-sm text-[#21573b]">
              <p className="font-semibold">Запись создана.</p>
              <p className="mt-1">
                {success.staff.name} · {formatBookingDateTime(success.startAt)} ·{' '}
                {formatCurrency(success.prices.finalTotal)}
              </p>
            </div>
          ) : null}

          {session.authenticated ? (
            <button
              type="submit"
              disabled={maintenanceMode || isSubmitting || services.length === 0}
              aria-busy={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--button-bg)] px-5 py-4 text-sm font-medium text-white transition hover:bg-[color:var(--button-bg-hover)] hover:text-white disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? <LoadingLabel label="Создаю запись..." /> : 'Подтвердить запись'}
            </button>
          ) : (
            <ButtonLink href="/account/login" className="w-full">
              Войти для записи
            </ButtonLink>
          )}
        </form>
      </div>
    </section>
  );
}
