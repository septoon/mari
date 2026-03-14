import { NextRequest } from 'next/server';

import { BackendError, backendRequest } from '@/lib/api/backend';
import { withClientAccess, attachClientCookies } from '@/lib/api/client-auth';
import { appointmentCreatedSchema, createAppointmentInputSchema } from '@/lib/api/contracts';
import { handleRouteError, jsonOk } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = createAppointmentInputSchema.parse(await request.json());
    try {
      const result = await withClientAccess(request, (accessToken) =>
        backendRequest('/appointments', appointmentCreatedSchema, {
          authToken: accessToken,
          init: {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              client: undefined
            })
          }
        })
      );

      return attachClientCookies(jsonOk(result.data, 201), result.refreshed);
    } catch (error) {
      if (error instanceof BackendError && error.status === 401) {
        throw new BackendError('Для записи нужен вход в кабинет клиента.', {
          status: 401,
          code: 'AUTH_REQUIRED'
        });
      }

      throw error;
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
