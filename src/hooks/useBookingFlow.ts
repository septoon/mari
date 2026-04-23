'use client';

import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState
} from 'react';

import { CLIENT_SLOT_BLOCKING_APPOINTMENT_STATUSES } from '@/lib/appointment-labels';
import { useClientSession } from '@/components/client-session-provider';
import {
  reachYandexMetrikaGoal,
  yandexMetrikaGoals
} from '@/components/analytics/yandex-metrika-goals';
import type { ClientApiError } from '@/lib/api/browser';
import type {
  ClientAppointmentsResult,
  CreatedAppointment,
  Service,
  SlotDaysResult,
  SlotsResult,
  SpecialistCard
} from '@/lib/api/contracts';
import { createAppointment, fetchClientAppointments, fetchSlotDays, fetchSlots } from '@/lib/booking/client';
import { fromPhoneE164, toPhoneE164 } from '@/lib/booking/phone';
import type {
  BookingClientForm,
  BookingFlowState,
  BookingInitialSelection,
  BookingSlotSelection,
  BookingStaffChoice,
  BookingStep
} from '@/lib/booking/types';
import {
  createInitialBookingState,
  getAvailableSpecialists,
  getBookingCategories,
  getBookingDraft,
  getBookingStateDirty,
  getFirstAvailableDate,
  isFutureBookingSlot,
  getPreviousStep,
  getSchedulePreviewContext,
  getSlotDaysKey,
  getSlotsKey,
  hasDateSlots
} from '@/lib/booking/utils';
import { getSalonDate } from '@/lib/format';

type Action =
  | { type: 'select-category'; categoryId: string }
  | { type: 'toggle-service'; serviceId: string; categoryId: string }
  | { type: 'clear-services'; categoryId: string | null }
  | { type: 'select-staff'; staffId: BookingStaffChoice | null }
  | { type: 'select-date'; date: string | null }
  | { type: 'select-slot'; slot: BookingSlotSelection | null }
  | { type: 'set-step'; step: BookingStep }
  | { type: 'update-client-form'; patch: Partial<BookingClientForm> }
  | { type: 'hydrate-client-form'; patch: Partial<BookingClientForm> }
  | { type: 'slot-days-request' }
  | { type: 'slot-days-success'; data: SlotDaysResult; recommendedDate: string | null }
  | { type: 'slot-days-error'; message: string }
  | { type: 'slots-request' }
  | { type: 'slots-success'; data: SlotsResult }
  | { type: 'slots-error'; message: string }
  | { type: 'set-form-errors'; errors: BookingFlowState['errors']['form'] }
  | { type: 'set-submit-error'; message: string | null }
  | { type: 'submit-start' }
  | { type: 'submit-success'; appointment: CreatedAppointment['appointment'] }
  | { type: 'submit-error'; message: string }
  | { type: 'reset'; state: BookingFlowState };

const BOOKING_SERVICE_STORAGE_KEY = 'mari.booking.selected-service-ids';
const AVAILABILITY_CACHE_TTL_MS = 30_000;

type CacheEntry<T> = {
  data: T;
  fetchedAt: number;
};

const hasSlotInResult = (slots: SlotsResult, slot: BookingSlotSelection | null) =>
  slot
    ? slots.results.some(
        (group) =>
          group.staffId === slot.staffId &&
          group.slots.some((item) => item.startAt === slot.startAt)
      )
    : false;

const getFreshCacheValue = <T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): T | null => {
  const cached = cache.get(key);
  if (!cached) {
    return null;
  }

  if (Date.now() - cached.fetchedAt > AVAILABILITY_CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

const setCacheValue = <T>(
  cache: Map<string, CacheEntry<T>>,
  key: string,
  data: T
) => {
  cache.set(key, {
    data,
    fetchedAt: Date.now()
  });
};

const reducer = (state: BookingFlowState, action: Action): BookingFlowState => {
  switch (action.type) {
    case 'select-category':
      return {
        ...state,
        step: 'service',
        selectedCategoryId: action.categoryId,
        selectedServiceIds: [],
        selectedStaffId: null,
        selectedDate: null,
        selectedSlot: null,
        slotDays: null,
        slots: null,
        successAppointment: null,
        errors: {
          ...state.errors,
          slotDays: null,
          slots: null,
          submit: null,
          form: {}
        }
      };
    case 'toggle-service': {
      const alreadySelected = state.selectedServiceIds.includes(action.serviceId);
      const nextServiceIds = alreadySelected
        ? state.selectedServiceIds.filter((serviceId) => serviceId !== action.serviceId)
        : [...state.selectedServiceIds, action.serviceId];

      return {
        ...state,
        selectedCategoryId: action.categoryId,
        selectedServiceIds: nextServiceIds,
        selectedDate: null,
        selectedSlot: null,
        slotDays: null,
        slots: null,
        successAppointment: null,
        errors: {
          ...state.errors,
          slotDays: null,
          slots: null,
          submit: null,
          form: {}
        }
      };
    }
    case 'clear-services':
      return {
        ...state,
        step: 'service',
        selectedCategoryId: action.categoryId,
        selectedServiceIds: [],
        selectedDate: null,
        selectedSlot: null,
        slotDays: null,
        slots: null,
        successAppointment: null,
        errors: {
          ...state.errors,
          slotDays: null,
          slots: null,
          submit: null,
          form: {}
        }
      };
    case 'select-staff':
      return {
        ...state,
        selectedStaffId: action.staffId,
        selectedDate: null,
        selectedSlot: null,
        slotDays: null,
        slots: null,
        successAppointment: null,
        errors: {
          ...state.errors,
          slotDays: null,
          slots: null,
          submit: null
        }
      };
    case 'select-date':
      return {
        ...state,
        selectedDate: action.date,
        selectedSlot: null,
        slots: null,
        errors: {
          ...state.errors,
          slots: null,
          submit: null
        }
      };
    case 'select-slot':
      return {
        ...state,
        selectedStaffId: action.slot ? action.slot.staffId : state.selectedStaffId,
        selectedDate: action.slot ? action.slot.startAt.slice(0, 10) : state.selectedDate,
        selectedSlot: action.slot,
        errors: {
          ...state.errors,
          submit: null
        }
      };
    case 'set-step':
      return {
        ...state,
        step: action.step,
        closeConfirmOpen: false,
        errors:
          action.step === 'client'
            ? state.errors
            : {
                ...state.errors,
                submit: null,
                form: {}
              }
      };
    case 'update-client-form':
      return {
        ...state,
        clientForm: {
          ...state.clientForm,
          ...action.patch
        },
        errors: {
          ...state.errors,
          submit: null,
          form: {
            ...state.errors.form,
            ...(action.patch.name !== undefined ? { name: undefined } : null),
            ...(action.patch.phone !== undefined ? { phone: undefined } : null),
            ...(action.patch.consentAccepted !== undefined ? { consent: undefined } : null)
          }
        }
      };
    case 'hydrate-client-form':
      return {
        ...state,
        clientForm: {
          ...state.clientForm,
          ...Object.fromEntries(
            Object.entries(action.patch).filter(([, value]) => {
              if (typeof value !== 'string') {
                return value !== undefined;
              }

              return value.trim().length > 0;
            })
          )
        }
      };
    case 'slot-days-request':
      return {
        ...state,
        loading: {
          ...state.loading,
          slotDays: true
        },
        errors: {
          ...state.errors,
          slotDays: null
        }
      };
    case 'slot-days-success': {
      const nextDate =
        state.selectedDate && hasDateSlots(action.data, state.selectedDate)
          ? state.selectedDate
          : action.recommendedDate;

      return {
        ...state,
        selectedDate: nextDate,
        selectedSlot:
          state.selectedSlot && nextDate === state.selectedDate ? state.selectedSlot : null,
        slotDays: action.data,
        loading: {
          ...state.loading,
          slotDays: false
        },
        errors: {
          ...state.errors,
          slotDays: null
        }
      };
    }
    case 'slot-days-error':
      return {
        ...state,
        slotDays: null,
        selectedDate: null,
        selectedSlot: null,
        slots: null,
        loading: {
          ...state.loading,
          slotDays: false
        },
        errors: {
          ...state.errors,
          slotDays: action.message
        }
      };
    case 'slots-request':
      return {
        ...state,
        loading: {
          ...state.loading,
          slots: true
        },
        errors: {
          ...state.errors,
          slots: null
        }
      };
    case 'slots-success':
      return {
        ...state,
        slots: action.data,
        selectedSlot: hasSlotInResult(action.data, state.selectedSlot) ? state.selectedSlot : null,
        loading: {
          ...state.loading,
          slots: false
        },
        errors: {
          ...state.errors,
          slots: null
        }
      };
    case 'slots-error':
      return {
        ...state,
        slots: null,
        selectedSlot: null,
        loading: {
          ...state.loading,
          slots: false
        },
        errors: {
          ...state.errors,
          slots: action.message
        }
      };
    case 'set-form-errors':
      return {
        ...state,
        errors: {
          ...state.errors,
          form: action.errors
        }
      };
    case 'set-submit-error':
      return {
        ...state,
        errors: {
          ...state.errors,
          submit: action.message
        }
      };
    case 'submit-start':
      return {
        ...state,
        loading: {
          ...state.loading,
          submit: true
        },
        errors: {
          ...state.errors,
          submit: null,
          form: {}
        }
      };
    case 'submit-success':
      return {
        ...state,
        step: 'success',
        successAppointment: action.appointment,
        loading: {
          ...state.loading,
          submit: false
        },
        errors: {
          ...state.errors,
          submit: null,
          form: {}
        },
        closeConfirmOpen: false
      };
    case 'submit-error':
      return {
        ...state,
        loading: {
          ...state.loading,
          submit: false
        },
        errors: {
          ...state.errors,
          submit: action.message
        }
      };
    case 'reset':
      return action.state;
    default:
      return state;
  }
};

export function useBookingFlow({
  services,
  specialists,
  initialSelection,
  restoreStoredService = true,
  startStep
}: {
  services: Service[];
  specialists: SpecialistCard[];
  initialSelection?: BookingInitialSelection;
  restoreStoredService?: boolean;
  startStep?: BookingStep;
}) {
  const { session } = useClientSession();
  const initialState = useMemo(
    () =>
      createInitialBookingState({
        services,
        initialSelection,
        startStep,
        sessionName: session.client?.name,
        sessionPhone: session.client?.phoneE164
      }),
    [initialSelection, services, session.client?.name, session.client?.phoneE164, startStep]
  );
  const [state, dispatch] = useReducer(reducer, initialState);
  const [availabilityVersion, refreshAvailability] = useReducer((value: number) => value + 1, 0);
  const [clientAppointments, setClientAppointments] = useState<ClientAppointmentsResult['items']>([]);
  const slotDaysCacheRef = useRef(new Map<string, CacheEntry<SlotDaysResult>>());
  const slotsCacheRef = useRef(new Map<string, CacheEntry<SlotsResult>>());
  const restoredServiceRef = useRef(false);

  const clearAvailabilityCache = useCallback(() => {
    slotDaysCacheRef.current.clear();
    slotsCacheRef.current.clear();
  }, []);

  const invalidateAvailability = useCallback(() => {
    clearAvailabilityCache();
    refreshAvailability();
  }, [clearAvailabilityCache]);

  const categories = useMemo(() => getBookingCategories(services), [services]);
  const selectedServices = useMemo(
    () =>
      state.selectedServiceIds
        .map((serviceId) => services.find((item) => item.id === serviceId) ?? null)
        .filter((item): item is Service => item !== null),
    [services, state.selectedServiceIds]
  );
  const selectedStaff = useMemo(
    () =>
      state.selectedStaffId && state.selectedStaffId !== 'any'
        ? specialists.find((item) => item.staffId === state.selectedStaffId) ?? null
        : null,
    [specialists, state.selectedStaffId]
  );
  const availableServices = useMemo(() => {
    if (!selectedStaff || state.selectedStaffId === 'any') {
      return services;
    }

    const supportedServiceIds = new Set(selectedStaff.services.map((service) => service.id));
    return services.filter((service) => supportedServiceIds.has(service.id));
  }, [selectedStaff, services, state.selectedStaffId]);
  const availableSpecialists = useMemo(
    () => getAvailableSpecialists(specialists, state.selectedServiceIds),
    [specialists, state.selectedServiceIds]
  );
  const schedulePreviewContext = useMemo(
    () =>
      getSchedulePreviewContext({
        selectedServiceIds: state.selectedServiceIds,
        selectedStaffId: state.selectedStaffId,
        specialists
      }),
    [specialists, state.selectedServiceIds, state.selectedStaffId]
  );
  const shouldLoadSlotDays =
    Boolean(state.selectedServiceIds.length > 0 && state.selectedStaffId) || state.step === 'date';
  const slotDaysEffectInput = useMemo(() => {
    const serviceIds = schedulePreviewContext?.serviceIds ?? [];
    const staffId = schedulePreviewContext?.staffId ?? null;

    if (!shouldLoadSlotDays || serviceIds.length === 0 || !staffId) {
      return null;
    }

    return {
      key: `${serviceIds.slice().sort().join(',')}:${staffId}`,
      serviceIds,
      staffId
    };
  }, [schedulePreviewContext?.serviceIds, schedulePreviewContext?.staffId, shouldLoadSlotDays]);
  const slotsEffectInput = useMemo(() => {
    const date = state.selectedDate;

    if (!date) {
      return null;
    }

    if (state.selectedServiceIds.length > 0 && state.selectedStaffId) {
      return {
        key: `${state.selectedServiceIds.slice().sort().join(',')}:${state.selectedStaffId}:${date}`,
        serviceIds: state.selectedServiceIds,
        staffId: state.selectedStaffId,
        date
      };
    }

    const serviceIds = schedulePreviewContext?.serviceIds ?? [];
    const staffId = schedulePreviewContext?.staffId ?? null;

    if (state.step !== 'date' || serviceIds.length === 0 || !staffId) {
      return null;
    }

    return {
      key: `${serviceIds.slice().sort().join(',')}:${staffId}:${date}`,
      serviceIds,
      staffId,
      date
    };
  }, [
    schedulePreviewContext?.serviceIds,
    schedulePreviewContext?.staffId,
    state.selectedDate,
    state.selectedServiceIds,
    state.selectedStaffId,
    state.step
  ]);
  const canChooseAnyStaff = availableSpecialists.length > 1;
  const hasCategoryStep = categories.length > 1;
  const previousStep = getPreviousStep({
    currentStep: state.step,
    initialStep: state.initialStep,
    hasCategoryStep
  });
  const isDirty = getBookingStateDirty(state);
  const draft = useMemo(
    () =>
      getBookingDraft({
        state,
        services,
        specialists
      }),
    [services, specialists, state]
  );
  const selectedDateAvailability = state.slotDays?.items.find((item) => item.date === state.selectedDate) ?? null;
  const blockedClientSlotStartTimes = useMemo(
    () =>
      new Set(
        clientAppointments
          .filter(
            (appointment) =>
              CLIENT_SLOT_BLOCKING_APPOINTMENT_STATUSES.has(appointment.status) &&
              isFutureBookingSlot(appointment.startAt)
          )
          .map((appointment) => appointment.startAt)
      ),
    [clientAppointments]
  );
  const hasBlockedSlotsOnSelectedDate = useMemo(
    () =>
      Boolean(
        state.selectedDate &&
          clientAppointments.some(
            (appointment) =>
              CLIENT_SLOT_BLOCKING_APPOINTMENT_STATUSES.has(appointment.status) &&
              isFutureBookingSlot(appointment.startAt) &&
              getSalonDate(appointment.startAt) === state.selectedDate
          )
      ),
    [clientAppointments, state.selectedDate]
  );
  const isSlotBlockedForClient = useCallback(
    (slot: BookingSlotSelection) => blockedClientSlotStartTimes.has(slot.startAt),
    [blockedClientSlotStartTimes]
  );

  useEffect(() => {
    if (!session.authenticated) {
      startTransition(() => {
        setClientAppointments([]);
      });
      return;
    }

    if (state.clientForm.name.trim() && state.clientForm.phone.trim()) {
      return;
    }

    startTransition(() => {
      dispatch({
        type: 'hydrate-client-form',
        patch: {
          name: session.client?.name ?? '',
          phone: fromPhoneE164(session.client?.phoneE164)
        }
      });
    });
  }, [session.authenticated, session.client?.name, session.client?.phoneE164, state.clientForm.name, state.clientForm.phone]);

  useEffect(() => {
    if (!session.authenticated) {
      return;
    }

    const controller = new AbortController();

    void fetchClientAppointments({
      signal: controller.signal
    })
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }

        startTransition(() => {
          setClientAppointments(result.items);
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        console.error('[LOAD_BOOKING_CLIENT_APPOINTMENTS_FAILED]', error);
      });

    return () => controller.abort();
  }, [session.authenticated]);

  useEffect(() => {
    if (!restoreStoredService) {
      return;
    }

    if (restoredServiceRef.current) {
      return;
    }

    restoredServiceRef.current = true;

    if (initialSelection?.serviceId || initialSelection?.serviceIds?.length) {
      return;
    }

    const storedValue = window.localStorage.getItem(BOOKING_SERVICE_STORAGE_KEY);
    if (!storedValue) {
      return;
    }

    const storedServiceIds = (() => {
      try {
        const parsed = JSON.parse(storedValue);
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string');
        }
      } catch {}

      return [storedValue];
    })();
    const validStoredServiceIds = storedServiceIds.filter((serviceId) =>
      services.some((item) => item.id === serviceId)
    );

    if (validStoredServiceIds.length === 0) {
      window.localStorage.removeItem(BOOKING_SERVICE_STORAGE_KEY);
      return;
    }

    validStoredServiceIds.forEach((serviceId) => {
      const storedService = services.find((item) => item.id === serviceId);
      if (!storedService) {
        return;
      }

      dispatch({
        type: 'toggle-service',
        serviceId: storedService.id,
        categoryId: storedService.category.id
      });
    });
    dispatch({ type: 'set-step', step: 'service' });
  }, [initialSelection?.serviceId, initialSelection?.serviceIds, restoreStoredService, services]);

  useEffect(() => {
    if (state.selectedServiceIds.length > 0) {
      window.localStorage.setItem(BOOKING_SERVICE_STORAGE_KEY, JSON.stringify(state.selectedServiceIds));
      return;
    }

    window.localStorage.removeItem(BOOKING_SERVICE_STORAGE_KEY);
  }, [state.selectedServiceIds]);

  useEffect(() => {
    if (!state.selectedStaffId) {
      return;
    }

    if (state.selectedStaffId === 'any') {
      if (canChooseAnyStaff) {
        return;
      }

      dispatch({
        type: 'select-staff',
        staffId: availableSpecialists.length === 1 ? availableSpecialists[0].staffId : null
      });
      return;
    }

    const exists = availableSpecialists.some((item) => item.staffId === state.selectedStaffId);
    if (exists) {
      return;
    }

    dispatch({ type: 'select-staff', staffId: null });
    dispatch({ type: 'set-step', step: 'staff' });
  }, [availableSpecialists, canChooseAnyStaff, state.selectedStaffId]);

  useEffect(() => {
    if (!state.selectedSlot || !isSlotBlockedForClient(state.selectedSlot)) {
      return;
    }

    dispatch({ type: 'select-slot', slot: null });
  }, [isSlotBlockedForClient, state.selectedSlot]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        invalidateAvailability();
      }
    };

    window.addEventListener('focus', invalidateAvailability);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', invalidateAvailability);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [invalidateAvailability]);

  useEffect(() => {
    if (!slotDaysEffectInput) {
      return;
    }

    const { serviceIds, staffId } = slotDaysEffectInput;
    const requestFrom = new Date();
    requestFrom.setMinutes(requestFrom.getMinutes() - requestFrom.getTimezoneOffset());
    const from = requestFrom.toISOString().slice(0, 10);
    const cacheKey = getSlotDaysKey({ serviceIds, staffId, from });

    if (!cacheKey) {
      return;
    }

    const cached = getFreshCacheValue(slotDaysCacheRef.current, cacheKey);
    if (cached) {
      dispatch({
        type: 'slot-days-success',
        data: cached,
        recommendedDate: getFirstAvailableDate(cached)
      });
      return;
    }

    const controller = new AbortController();
    dispatch({ type: 'slot-days-request' });

    void fetchSlotDays({
      from,
      serviceIds,
      staffId,
      signal: controller.signal
    })
      .then((result) => {
        setCacheValue(slotDaysCacheRef.current, cacheKey, result);
        dispatch({
          type: 'slot-days-success',
          data: result,
          recommendedDate: getFirstAvailableDate(result)
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        dispatch({
          type: 'slot-days-error',
          message: error instanceof Error ? error.message : 'Не удалось загрузить доступные даты'
        });
      });

    return () => controller.abort();
  }, [availabilityVersion, slotDaysEffectInput]);

  useEffect(() => {
    if (!slotsEffectInput) {
      return;
    }

    const { serviceIds, staffId, date } = slotsEffectInput;
    const cacheKey = getSlotsKey({ serviceIds, staffId, date });
    if (!cacheKey) {
      return;
    }

    const cached = getFreshCacheValue(slotsCacheRef.current, cacheKey);
    if (cached) {
      dispatch({ type: 'slots-success', data: cached });
      return;
    }

    const controller = new AbortController();
    dispatch({ type: 'slots-request' });

    void fetchSlots({
      date,
      serviceIds,
      staffId,
      signal: controller.signal
    })
      .then((result) => {
        setCacheValue(slotsCacheRef.current, cacheKey, result);
        dispatch({ type: 'slots-success', data: result });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        dispatch({
          type: 'slots-error',
          message: error instanceof Error ? error.message : 'Не удалось загрузить свободное время'
        });
      });

    return () => controller.abort();
  }, [availabilityVersion, slotsEffectInput]);

  const reset = useCallback(() => {
    invalidateAvailability();
    dispatch({
      type: 'reset',
      state: createInitialBookingState({
        services,
        initialSelection,
        startStep,
        sessionName: session.client?.name,
        sessionPhone: session.client?.phoneE164
      })
    });
  }, [initialSelection, invalidateAvailability, services, session.client?.name, session.client?.phoneE164, startStep]);

  const goBack = useCallback(() => {
    if (!previousStep) {
      return false;
    }

    dispatch({ type: 'set-step', step: previousStep });
    return true;
  }, [previousStep]);

  const requestStep = useCallback(
    (step: BookingStep) => {
      const guards: Record<Exclude<BookingStep, 'overview' | 'category' | 'success'>, boolean> = {
        service: true,
        staff: true,
        date: Boolean(state.selectedServiceIds.length > 0 && state.selectedStaffId),
        time: Boolean(state.selectedServiceIds.length > 0 && state.selectedStaffId && state.selectedDate),
        client: Boolean(state.selectedSlot)
      };

      if (step === 'overview' || step === 'category' || step === 'success') {
        dispatch({ type: 'set-step', step });
        return true;
      }

      if (!guards[step]) {
        return false;
      }

      dispatch({ type: 'set-step', step });
      return true;
    },
    [state.selectedDate, state.selectedServiceIds, state.selectedSlot, state.selectedStaffId]
  );

  const selectCategory = useCallback((categoryId: string) => {
    dispatch({ type: 'select-category', categoryId });
  }, []);

  const selectService = useCallback(
    (serviceId: string) => {
      const categoryId =
        services.find((item) => item.id === serviceId)?.category.id ?? state.selectedCategoryId ?? '';

      dispatch({
        type: 'toggle-service',
        serviceId,
        categoryId
      });
    },
    [services, state.selectedCategoryId]
  );

  const selectStaff = useCallback((staffId: BookingStaffChoice) => {
    dispatch({ type: 'select-staff', staffId });
  }, []);

  const selectDate = useCallback((date: string) => {
    dispatch({ type: 'select-date', date });
  }, []);

  const selectSlot = useCallback((slot: BookingSlotSelection) => {
    if (isSlotBlockedForClient(slot)) {
      return;
    }

    dispatch({ type: 'select-slot', slot });
  }, [isSlotBlockedForClient]);

  const openDateCalendar = useCallback(
    ({
      staffId,
      date
    }: {
      staffId?: BookingStaffChoice;
      date?: string | null;
    } = {}) => {
      const nextStaffId = staffId ?? state.selectedStaffId ?? 'any';

      if (nextStaffId !== state.selectedStaffId) {
        dispatch({ type: 'select-staff', staffId: nextStaffId });
      }

      if (date !== undefined) {
        dispatch({ type: 'select-date', date });
      }

      dispatch({ type: 'set-step', step: 'date' });
    },
    [state.selectedStaffId]
  );

  const selectPreviewSlot = useCallback(
    (slot: BookingSlotSelection) => {
      if (isSlotBlockedForClient(slot)) {
        return;
      }

      if (state.selectedServiceIds.length === 0) {
        openDateCalendar({
          staffId: slot.staffId,
          date: slot.startAt.slice(0, 10)
        });
        return;
      }

      if (slot.staffId !== state.selectedStaffId) {
        dispatch({ type: 'select-staff', staffId: slot.staffId });
      }

      dispatch({ type: 'select-date', date: slot.startAt.slice(0, 10) });
      dispatch({ type: 'select-slot', slot });
      dispatch({ type: 'set-step', step: 'time' });
    },
    [isSlotBlockedForClient, openDateCalendar, state.selectedServiceIds.length, state.selectedStaffId]
  );

  const updateClientForm = useCallback((patch: Partial<BookingClientForm>) => {
    dispatch({ type: 'update-client-form', patch });
  }, []);

  const requestClose = useCallback(() => {
    return !state.loading.submit;
  }, [state.loading.submit]);

  const submit = useCallback(async () => {
    const formErrors: BookingFlowState['errors']['form'] = {};

    if (!state.clientForm.name.trim()) {
      formErrors.name = 'Укажите имя клиента.';
    }

    if (state.clientForm.phone.trim().length !== 10) {
      formErrors.phone = 'Введите телефон в формате +7XXXXXXXXXX.';
    }

    if (!state.clientForm.consentAccepted) {
      formErrors.consent = 'Подтвердите согласие на обработку персональных данных.';
    }

    if (state.selectedServiceIds.length === 0 || !state.selectedStaffId || !state.selectedSlot) {
      dispatch({
        type: 'set-submit-error',
        message: 'Сначала завершите выбор услуги, специалиста и времени.'
      });
      return false;
    }

    if (isSlotBlockedForClient(state.selectedSlot)) {
      dispatch({
        type: 'set-submit-error',
        message: 'У вас уже есть запись на это время. Выберите другой слот.'
      });
      return false;
    }

    if (!isFutureBookingSlot(state.selectedSlot.startAt)) {
      dispatch({
        type: 'set-submit-error',
        message: 'Это время уже прошло. Выберите другой слот.'
      });
      return false;
    }

    if (Object.keys(formErrors).length > 0) {
      dispatch({ type: 'set-form-errors', errors: formErrors });
      return false;
    }

    dispatch({ type: 'submit-start' });

    try {
      const slotStaffId = state.selectedSlot.staffId;
      const payload = await createAppointment({
        payload: {
          serviceIds: state.selectedServiceIds,
          staffId: slotStaffId,
          startAt: state.selectedSlot.startAt,
          comment: state.clientForm.comment.trim() || undefined,
          promoCode: state.clientForm.promoCode.trim() || undefined,
          client: {
            name: state.clientForm.name.trim(),
            phone: toPhoneE164(state.clientForm.phone)
          }
        }
      });

      reachYandexMetrikaGoal(yandexMetrikaGoals.bookingCreated, {
        order_price: payload.appointment.prices.finalTotal,
        currency: 'RUB',
        services_count: payload.appointment.services.length,
        specialist_name: payload.appointment.staff.name
      });

      clearAvailabilityCache();
      dispatch({ type: 'submit-success', appointment: payload.appointment });
      return true;
    } catch (error) {
      const apiError = error as ClientApiError;
      dispatch({
        type: 'submit-error',
        message:
          apiError?.message ||
          (error instanceof Error ? error.message : 'Не удалось создать запись')
      });
      return false;
    }
  }, [clearAvailabilityCache, isSlotBlockedForClient, state.clientForm.comment, state.clientForm.consentAccepted, state.clientForm.name, state.clientForm.phone, state.clientForm.promoCode, state.selectedServiceIds, state.selectedSlot, state.selectedStaffId]);

  return {
    state,
    session,
    categories,
    draft,
    isDirty,
    hasCategoryStep,
    previousStep,
    selectedServices,
    selectedStaff,
    availableServices,
    availableSpecialists,
    canChooseAnyStaff,
    selectedDateAvailability,
    hasBlockedSlotsOnSelectedDate,
    isSlotBlockedForClient,
    selectCategory,
    selectService,
    selectStaff,
    selectDate,
    selectSlot,
    openDateCalendar,
    selectPreviewSlot,
    updateClientForm,
    requestStep,
    goBack,
    requestClose,
    reset,
    submit
  };
}
