import type { Service, SlotDaysResult, SlotsResult, SpecialistCard } from '@/lib/api/contracts';
import type {
  BookingDraft,
  BookingFlowState,
  BookingInitialSelection,
  BookingStep,
  BookingStaffChoice,
} from '@/lib/booking/types';

import { fromPhoneE164 } from '@/lib/booking/phone';

const STEP_ORDER: BookingStep[] = ['category', 'service', 'staff', 'date', 'time', 'client', 'success'];

export const getLocalDate = (offsetDays = 0) => {
  const value = new Date();
  value.setDate(value.getDate() + offsetDays);
  value.setMinutes(value.getMinutes() - value.getTimezoneOffset());
  return value.toISOString().slice(0, 10);
};

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

export const getAvailableSpecialists = (specialists: SpecialistCard[], serviceId: string | null) => {
  if (!serviceId) {
    return [];
  }

  return specialists.filter((specialist) =>
    specialist.services.some((service) => service.id === serviceId)
  );
};

export const getInitialCategoryId = (services: Service[], initialSelection?: BookingInitialSelection) => {
  if (initialSelection?.serviceId) {
    return services.find((service) => service.id === initialSelection.serviceId)?.category.id ?? null;
  }

  const categories = getBookingCategories(services);
  return categories.length === 1 ? categories[0].id : null;
};

export const getInitialStep = (services: Service[], initialSelection?: BookingInitialSelection): BookingStep => {
  const categories = getBookingCategories(services);

  if (initialSelection?.serviceId && initialSelection?.staffId) {
    return 'date';
  }

  if (initialSelection?.serviceId) {
    return 'staff';
  }

  return categories.length === 1 ? 'service' : 'category';
};

export const createInitialBookingState = ({
  services,
  initialSelection,
  sessionName,
  sessionPhone
}: {
  services: Service[];
  initialSelection?: BookingInitialSelection;
  sessionName?: string | null;
  sessionPhone?: string | null;
}): BookingFlowState => {
  const initialStep = getInitialStep(services, initialSelection);
  const selectedService = initialSelection?.serviceId
    ? services.find((service) => service.id === initialSelection.serviceId) ?? null
    : null;
  const selectedCategoryId = selectedService?.category.id ?? getInitialCategoryId(services, initialSelection);

  return {
    step: initialStep,
    initialStep,
    selectedCategoryId,
    selectedServiceId: selectedService?.id ?? null,
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

  if (currentStep === 'service' && !hasCategoryStep) {
    return null;
  }

  return currentStep === 'service' ? 'category' : STEP_ORDER[currentIndex - 1];
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
  const service = state.selectedServiceId
    ? services.find((item) => item.id === state.selectedServiceId) ?? null
    : null;
  const staff =
    state.selectedStaffId && state.selectedStaffId !== 'any'
      ? specialists.find((item) => item.staffId === state.selectedStaffId) ?? null
      : null;

  return {
    category: service ? service.category : null,
    service,
    staff,
    isAnyStaff: state.selectedStaffId === 'any',
    date: state.selectedDate,
    slot: state.selectedSlot,
    client: state.clientForm
  };
};

export const getBookingStateDirty = (state: BookingFlowState) =>
  Boolean(
    state.selectedCategoryId ||
      state.selectedServiceId ||
      state.selectedStaffId ||
      state.selectedDate ||
      state.selectedSlot ||
      state.clientForm.name.trim() ||
      state.clientForm.phone.trim() ||
      state.clientForm.comment.trim() ||
      state.clientForm.promoCode.trim()
  );

export const getSlotsKey = ({
  serviceId,
  staffId,
  date
}: {
  serviceId: string | null;
  staffId: BookingStaffChoice | null;
  date: string | null;
}) => {
  if (!serviceId || !staffId || !date) {
    return null;
  }

  return [serviceId, staffId, date].join(':');
};

export const getSlotDaysKey = ({
  serviceId,
  staffId,
  from
}: {
  serviceId: string | null;
  staffId: BookingStaffChoice | null;
  from: string;
}) => {
  if (!serviceId || !staffId) {
    return null;
  }

  return [serviceId, staffId, from].join(':');
};

export const getTimeOfDayLabel = (iso: string) => {
  const hour = new Date(iso).getHours();

  if (hour < 12) {
    return 'Утро';
  }

  if (hour < 18) {
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

  const groups = new Map<string, typeof source>();

  for (const slot of source) {
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
