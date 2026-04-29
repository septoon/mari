'use client';

import {
  appointmentCreatedSchema,
  clientAppointmentsSchema,
  scheduleDaysResultSchema,
  slotDaysResultSchema,
  slotsResultSchema,
  type ClientAppointmentsResult,
  type CreatedAppointment,
  type SlotDaysResult,
  type SlotsResult
} from '@/lib/api/contracts';
import { filterSlotDaysResult, filterSlotsResult } from '@/lib/booking/utils';
import { readApiOk } from '@/lib/api/browser';

export const fetchSlotDays = async ({
  from,
  serviceIds,
  staffId,
  signal
}: {
  from: string;
  serviceIds: string[];
  staffId: string | 'any';
  signal?: AbortSignal;
}) => {
  const searchParams = new URLSearchParams({
    from,
    days: '31',
    serviceIds: serviceIds.join(','),
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

export const fetchScheduleDays = async ({
  from,
  staffId,
  signal
}: {
  from: string;
  staffId: string | 'any';
  signal?: AbortSignal;
}) => {
  const searchParams = new URLSearchParams({
    from,
    days: '31',
    anyStaff: String(staffId === 'any')
  });

  if (staffId !== 'any') {
    searchParams.set('staffId', staffId);
  }

  const response = await fetch(`/api/schedule-days?${searchParams.toString()}`, {
    method: 'GET',
    cache: 'no-store',
    signal
  });

  const payload = await readApiOk(response, scheduleDaysResultSchema);
  return filterSlotDaysResult(payload) as SlotDaysResult;
};

export const fetchSlots = async ({
  date,
  serviceIds,
  staffId,
  signal
}: {
  date: string;
  serviceIds: string[];
  staffId: string | 'any';
  signal?: AbortSignal;
}) => {
  const searchParams = new URLSearchParams({
    date,
    serviceIds: serviceIds.join(','),
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

export const fetchClientAppointments = async ({
  limit = 50,
  signal
}: {
  limit?: number;
  signal?: AbortSignal;
}) => {
  const response = await fetch(`/api/client/appointments?limit=${limit}`, {
    method: 'GET',
    cache: 'no-store',
    signal
  });

  return readApiOk(response, clientAppointmentsSchema) as Promise<ClientAppointmentsResult>;
};
