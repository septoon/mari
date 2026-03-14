import { NextRequest } from 'next/server';

import { backendRequest } from '@/lib/api/backend';
import { attachClientCookies, withClientAccess } from '@/lib/api/client-auth';
import { cancelAppointmentInputSchema, cancelAppointmentResultSchema } from '@/lib/api/contracts';
import { handleRouteError, jsonOk } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const body = cancelAppointmentInputSchema.parse(await request.json());
    const { id } = await context.params;

    const result = await withClientAccess(request, (accessToken) =>
      backendRequest(`/client/appointments/${id}/cancel`, cancelAppointmentResultSchema, {
        authToken: accessToken,
        init: {
          method: 'POST',
          body: JSON.stringify(body)
        }
      })
    );

    return attachClientCookies(jsonOk(result.data), result.refreshed);
  } catch (error) {
    return handleRouteError(error);
  }
}
