import type { Service, SlotDaysResult, SlotsResult, SpecialistCard } from '@/lib/api/contracts';
import type {
  BookingDraft,
  BookingFlowState,
  BookingInitialSelection,
  BookingStep,
  BookingStaffChoice,
} from '@/lib/booking/types';

import { getSalonMinutesFromMidnight } from '@/lib/format';
import { fromPhoneE164 } from '@/lib/booking/phone';

const STEP_ORDER: BookingStep[] = ['overview', 'category', 'service', 'staff', 'date', 'time', 'client', 'success'];

export const getLocalDate = (offsetDays = 0) => {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 10);
};

export const isFutureBookingSlot = (iso: string, nowTimestamp = Date.now()) =>
  new Date(iso).getTime() > nowTimestamp;

export const parseCalendarDate = (value: string) => new Date(`${value}T00:00:00`);

export const getBookingCategories = (services: Service[]) =>
  services.reduce<Array<{ id: string; name: string; servicesCount: number; description: string | null }>>(
    (acc, service) => {
      const existing = acc.find((item) => item.id === service.category.id);

      if (existing) {
        existing.servicesCount += 1;
        if (!existing.description && service.description?.trim()) {
          existing.description = service.description.trim();
        }
        return acc;
      }

      acc.push({
        id: service.category.id,
        name: service.category.name,
        servicesCount: 1,
        description: service.description?.trim() || null
      });
      return acc;
    },
    []
  );

export const getAvailableSpecialists = (specialists: SpecialistCard[], serviceIds: string[]) => {
  if (serviceIds.length === 0) {
    return specialists
      .filter((specialist) => specialist.isVisible && specialist.isActive && !specialist.firedAt)
      .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, 'ru'));
  }

  return specialists
    .filter(
      (specialist) =>
        specialist.isVisible &&
        specialist.isActive &&
        !specialist.firedAt &&
        serviceIds.every((serviceId) => specialist.services.some((service) => service.id === serviceId))
    )
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, 'ru'));
};

const getVisibleActiveSpecialists = (specialists: SpecialistCard[]) =>
  specialists
    .filter((specialist) => specialist.isVisible && specialist.isActive && !specialist.firedAt)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name, 'ru'));

export const getPreviewServiceIdForSpecialist = (specialist: SpecialistCard | null) =>
  specialist?.services
    .slice()
    .sort(
      (left, right) =>
        left.durationSec - right.durationSec ||
        left.priceMin - right.priceMin ||
        left.name.localeCompare(right.name, 'ru')
    )[0]?.id ?? null;

export const getSchedulePreviewContext = ({
  selectedServiceIds,
  selectedStaffId,
  specialists
}: {
  selectedServiceIds: string[];
  selectedStaffId: BookingStaffChoice | null;
  specialists: SpecialistCard[];
}) => {
  if (selectedServiceIds.length > 0 && selectedStaffId) {
    return {
      serviceIds: selectedServiceIds,
      staffId: selectedStaffId
    };
  }

  if (selectedServiceIds.length > 0) {
    return {
      serviceIds: selectedServiceIds,
      staffId: 'any' as const
    };
  }

  const visibleSpecialists = getVisibleActiveSpecialists(specialists);

  if (selectedStaffId && selectedStaffId !== 'any') {
    const specialist = visibleSpecialists.find((item) => item.staffId === selectedStaffId) ?? null;
    const serviceId = getPreviewServiceIdForSpecialist(specialist);

    return serviceId
      ? {
          serviceIds: [serviceId],
          staffId: selectedStaffId
        }
      : null;
  }

  const fallbackServiceId = visibleSpecialists
    .map((specialist) => getPreviewServiceIdForSpecialist(specialist))
    .find(Boolean);

  return fallbackServiceId
    ? {
        serviceIds: [fallbackServiceId],
        staffId: 'any' as const
      }
    : null;
};

export const getInitialCategoryId = (services: Service[], initialSelection?: BookingInitialSelection) => {
  const initialServiceIds =
    initialSelection?.serviceIds?.filter(Boolean) ??
    (initialSelection?.serviceId ? [initialSelection.serviceId] : []);

  if (initialServiceIds.length > 0) {
    return services.find((service) => service.id === initialServiceIds[0])?.category.id ?? null;
  }

  const categories = getBookingCategories(services);
  return categories.length === 1 ? categories[0].id : null;
};

export const getInitialStep = (services: Service[], initialSelection?: BookingInitialSelection): BookingStep => {
  const categories = getBookingCategories(services);
  const initialServiceIds =
    initialSelection?.serviceIds?.filter(Boolean) ??
    (initialSelection?.serviceId ? [initialSelection.serviceId] : []);

  if (initialServiceIds.length > 0 && initialSelection?.staffId) {
    return 'date';
  }

  if (initialServiceIds.length > 0) {
    return 'staff';
  }

  return categories.length === 1 ? 'service' : 'category';
};

export const createInitialBookingState = ({
  services,
  initialSelection,
  startStep,
  sessionName,
  sessionPhone
}: {
  services: Service[];
  initialSelection?: BookingInitialSelection;
  startStep?: BookingStep;
  sessionName?: string | null;
  sessionPhone?: string | null;
}): BookingFlowState => {
  const initialStep = startStep ?? getInitialStep(services, initialSelection);
  const initialServiceIds = Array.from(
    new Set(
      initialSelection?.serviceIds?.filter((serviceId) => services.some((service) => service.id === serviceId)) ??
        (initialSelection?.serviceId && services.some((service) => service.id === initialSelection.serviceId)
          ? [initialSelection.serviceId]
          : [])
    )
  );
  const selectedCategoryId =
    services.find((service) => service.id === initialServiceIds[0])?.category.id ??
    getInitialCategoryId(services, initialSelection);

  return {
    step: initialStep,
    initialStep,
    selectedCategoryId,
    selectedServiceIds: initialServiceIds,
    selectedStaffId: initialSelection?.staffId ?? null,
    selectedDate: null,
    selectedSlot: null,
    clientForm: {
      name: sessionName?.trim() || '',
      phone: fromPhoneE164(sessionPhone),
      comment: '',
      promoCode: '',
      consentAccepted: false
    },
    slotDays: null,
    slots: null,
    successAppointment: null,
    loading: {
      slotDays: false,
      slots: false,
      submit: false
    },
    errors: {
      slotDays: null,
      slots: null,
      submit: null,
      form: {}
    },
    closeConfirmOpen: false
  };
};

export const getPreviousStep = ({
  currentStep,
  initialStep,
  hasCategoryStep
}: {
  currentStep: BookingStep;
  initialStep: BookingStep;
  hasCategoryStep: boolean;
}) => {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  const initialIndex = STEP_ORDER.indexOf(initialStep);

  if (currentIndex <= initialIndex) {
    return null;
  }

  if (currentStep === 'service' && initialStep === 'overview') {
    return 'overview';
  }

  const previousStep = STEP_ORDER[currentIndex - 1] ?? null;

  if (previousStep === 'category' && !hasCategoryStep) {
    return STEP_ORDER[currentIndex - 2] ?? null;
  }

  return previousStep;
};

export const getFirstAvailableDate = (slotDays: SlotDaysResult | null) =>
  slotDays?.items.find((item) => item.hasSlots)?.date ?? null;

export const hasDateSlots = (slotDays: SlotDaysResult | null, date: string | null) =>
  Boolean(slotDays?.items.some((item) => item.date === date && item.hasSlots));

export const getBookingDraft = ({
  state,
  services,
  specialists
}: {
  state: BookingFlowState;
  services: Service[];
  specialists: SpecialistCard[];
}): BookingDraft => {
  const selectedServices = state.selectedServiceIds
    .map((serviceId) => services.find((item) => item.id === serviceId) ?? null)
    .filter((item): item is Service => item !== null);
  const staff =
    state.selectedStaffId && state.selectedStaffId !== 'any'
      ? specialists.find((item) => item.staffId === state.selectedStaffId) ?? null
      : null;
  const categories = selectedServices.reduce<Map<string, { id: string; name: string }>>((acc, service) => {
    if (!acc.has(service.category.id)) {
      acc.set(service.category.id, {
        id: service.category.id,
        name: service.category.name
      });
    }
    return acc;
  }, new Map());
  const totalDurationSec = selectedServices.reduce((total, service) => total + service.durationSec, 0);
  const totalPriceMin = selectedServices.reduce((total, service) => total + service.priceMin, 0);
  const totalPriceMax = selectedServices.some((service) => service.priceMax === null)
    ? null
    : selectedServices.reduce((total, service) => total + (service.priceMax ?? service.priceMin), 0);

  return {
    category: categories.size === 1 ? Array.from(categories.values())[0] : null,
    services: selectedServices,
    staff,
    isAnyStaff: state.selectedStaffId === 'any',
    date: state.selectedDate,
    slot: state.selectedSlot,
    client: state.clientForm,
    totalDurationSec,
    totalPriceMin,
    totalPriceMax
  };
};

export const getBookingStateDirty = (state: BookingFlowState) =>
  Boolean(
    state.selectedCategoryId ||
      state.selectedServiceIds.length > 0 ||
      state.selectedStaffId ||
      state.selectedDate ||
      state.selectedSlot ||
      state.clientForm.name.trim() ||
      state.clientForm.phone.trim() ||
      state.clientForm.comment.trim() ||
      state.clientForm.promoCode.trim()
  );

export const getSlotsKey = ({
  serviceIds,
  staffId,
  date
}: {
  serviceIds: string[];
  staffId: BookingStaffChoice | null;
  date: string | null;
}) => {
  if (serviceIds.length === 0 || !staffId || !date) {
    return null;
  }

  return [serviceIds.slice().sort().join(','), staffId, date].join(':');
};

export const getSlotDaysKey = ({
  serviceIds,
  staffId,
  from
}: {
  serviceIds: string[];
  staffId: BookingStaffChoice | null;
  from: string;
}) => {
  if (serviceIds.length === 0 || !staffId) {
    return null;
  }

  return [serviceIds.slice().sort().join(','), staffId, from].join(':');
};

export const filterSlotDaysResult = (slotDays: SlotDaysResult): SlotDaysResult => {
  const today = getLocalDate();

  return {
    ...slotDays,
    items: slotDays.items.map((item) => {
      if (item.date >= today) {
        return item;
      }

      return {
        ...item,
        hasSlots: false,
        totalSlots: 0,
        firstSlotAt: null
      };
    })
  };
};

export const filterSlotsResult = (
  slots: SlotsResult,
  nowTimestamp = Date.now()
): SlotsResult => ({
  ...slots,
  results: slots.results
    .map((group) => ({
      ...group,
      slots: group.slots.filter((slot) => isFutureBookingSlot(slot.startAt, nowTimestamp))
    }))
    .filter((group) => group.slots.length > 0)
});

export const getTimeOfDayLabel = (iso: string) => {
  const minutesFromMidnight = getSalonMinutesFromMidnight(iso);

  if (minutesFromMidnight < 12 * 60) {
    return 'Утро';
  }

  if (minutesFromMidnight < 18 * 60) {
    return 'День';
  }

  return 'Вечер';
};

export const groupSlotsByTimeOfDay = (slots: SlotsResult | null) => {
  const source = slots?.results.flatMap((group) =>
    group.slots.map((slot) => ({
      ...slot,
      staffId: group.staffId,
      staffName: group.staffName
    }))
  ) ?? [];

  const normalized = source
    .filter((slot) => isFutureBookingSlot(slot.startAt))
    .sort((left, right) => {
      const timestampDiff = new Date(left.startAt).getTime() - new Date(right.startAt).getTime();

      if (timestampDiff !== 0) {
        return timestampDiff;
      }

      return left.staffName.localeCompare(right.staffName, 'ru');
    });

  const groups = new Map<string, typeof source>();

  for (const slot of normalized) {
    const key = getTimeOfDayLabel(slot.startAt);
    const current = groups.get(key) ?? [];
    current.push(slot);
    groups.set(key, current);
  }

  return Array.from(groups.entries()).map(([label, items]) => ({
    label,
    items
  }));
};
