import type { CreatedAppointment, Service, SlotDaysResult, SlotsResult, SpecialistCard } from '@/lib/api/contracts';

export type BookingStep =
  | 'overview'
  | 'category'
  | 'service'
  | 'staff'
  | 'date'
  | 'time'
  | 'client'
  | 'success';

export type BookingStaffChoice = 'any' | string;

export type BookingClientForm = {
  name: string;
  phone: string;
  comment: string;
  promoCode: string;
  consentAccepted: boolean;
};

export type BookingSlotSelection = {
  staffId: string;
  staffName: string;
  startAt: string;
  endAt: string;
};

export type BookingInitialSelection = {
  serviceIds?: string[] | null;
  serviceId?: string | null;
  staffId?: string | null;
};

export type BookingFlowState = {
  step: BookingStep;
  initialStep: BookingStep;
  selectedCategoryId: string | null;
  selectedServiceIds: string[];
  selectedStaffId: BookingStaffChoice | null;
  selectedDate: string | null;
  selectedSlot: BookingSlotSelection | null;
  clientForm: BookingClientForm;
  slotDays: SlotDaysResult | null;
  slots: SlotsResult | null;
  successAppointment: CreatedAppointment['appointment'] | null;
  loading: {
    slotDays: boolean;
    slots: boolean;
    submit: boolean;
  };
  errors: {
    slotDays: string | null;
    slots: string | null;
    submit: string | null;
    form: Partial<Record<'name' | 'phone' | 'consent', string>>;
  };
  closeConfirmOpen: boolean;
};

export type BookingDraft = {
  category: { id: string; name: string } | null;
  services: Service[];
  staff: SpecialistCard | null;
  isAnyStaff: boolean;
  date: string | null;
  slot: BookingSlotSelection | null;
  client: BookingClientForm;
  totalDurationSec: number;
  totalPriceMin: number;
  totalPriceMax: number | null;
};

export type BookingPageClientProps = {
  services: Service[];
  specialists: SpecialistCard[];
  maintenanceMode: boolean;
  maintenanceMessage?: string | null;
  consentLabel: string;
  initialSelection?: BookingInitialSelection;
  visibility?: {
    panel: boolean;
    schedule: boolean;
    confirmation: boolean;
  };
};
