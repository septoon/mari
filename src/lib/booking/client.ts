'use client';

import {
  appointmentCreatedSchema,
  slotDaysResultSchema,
  slotsResultSchema,
  type CreatedAppointment,
  type SlotDaysResult,
  type SlotsResult
} from '@/lib/api/contracts';
import { filterSlotDaysResult, filterSlotsResult } from '@/lib/booking/utils';
import { readApiOk } from '@/lib/api/browser';

export const fetchSlotDays = async ({
  from,
  serviceId,
  staffId,
  signal
}: {
  from: string;
  serviceId: string;
  staffId: string | 'any';
  signal?: AbortSignal;
}) => {
  const searchParams = new URLSearchParams({
    from,
    days: '21',
    serviceIds: serviceId,
    anyStaff: String(staffId === 'any')
  });

  if (staffId !== 'any') {
    searchParams.set('staffId', staffId);
  }

  const response = await fetch(`/api/slot-days?${searchParams.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    signal
  });

  const payload = await readApiOk(response, slotDaysResultSchema);
  return filterSlotDaysResult(payload) as SlotDaysResult;
};

export const fetchSlots = async ({
  date,
  serviceId,
  staffId,
  signal
}: {
  date: string;
  serviceId: string;
  staffId: string | 'any';
  signal?: AbortSignal;
}) => {
  const searchParams = new URLSearchParams({
    date,
    serviceIds: serviceId,
    anyStaff: String(staffId === 'any')
  });

  if (staffId !== 'any') {
    searchParams.set('staffId', staffId);
  }

  const response = await fetch(`/api/slots?${searchParams.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    signal
  });

  const payload = await readApiOk(response, slotsResultSchema);
  return filterSlotsResult(payload) as SlotsResult;
};

export const createAppointment = async ({
  payload,
  signal
}: {
  payload: Record<string, unknown>;
  signal?: AbortSignal;
}) => {
  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal
  });

  return readApiOk(response, appointmentCreatedSchema) as Promise<CreatedAppointment>;
};
