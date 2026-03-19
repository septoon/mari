import type { CreatedAppointment } from '@/lib/api/contracts';

export const APPOINTMENT_STATUS_LABELS: Record<
  CreatedAppointment['appointment']['status'],
  string
> = {
  PENDING: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждена',
  ARRIVED: 'Визит состоялся',
  NO_SHOW: 'Клиент не пришел',
  CANCELLED: 'Отменена'
};

export const PAYMENT_STATUS_LABELS: Record<
  CreatedAppointment['appointment']['payment']['status'],
  string
> = {
  UNPAID: 'Не оплачена',
  PARTIAL: 'Частично оплачена',
  PAID: 'Оплачена'
};

export const PAYMENT_METHOD_LABELS: Record<
  CreatedAppointment['appointment']['payment']['method'],
  string
> = {
  CASH: 'Наличные',
  CARD: 'Карта',
  TRANSFER: 'Перевод',
  OTHER: 'Другое'
};

export const CANCELLABLE_APPOINTMENT_STATUSES = new Set<
  CreatedAppointment['appointment']['status']
>(['PENDING', 'CONFIRMED']);

export const formatAppointmentStatus = (
  status: CreatedAppointment['appointment']['status']
) => APPOINTMENT_STATUS_LABELS[status];
