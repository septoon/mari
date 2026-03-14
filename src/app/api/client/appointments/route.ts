import { NextRequest } from 'next/server';

import { backendRequest } from '@/lib/api/backend';
import { attachClientCookies, withClientAccess } from '@/lib/api/client-auth';
import { clientAppointmentsQuerySchema, clientAppointmentsSchema } from '@/lib/api/contracts';
import { handleRouteError, jsonOk } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const query = clientAppointmentsQuerySchema.parse({
      page: request.nextUrl.searchParams.get('page') ?? undefined,
      limit: request.nextUrl.searchParams.get('limit') ?? undefined
    });

    const result = await withClientAccess(request, (accessToken) =>
      backendRequest(`/client/appointments?page=${query.page}&limit=${query.limit}`, clientAppointmentsSchema, {
        authToken: accessToken
      })
    );

    return attachClientCookies(jsonOk(result.data), result.refreshed);
  } catch (error) {
    return handleRouteError(error);
  }
}
