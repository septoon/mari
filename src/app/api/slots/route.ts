import { NextRequest } from 'next/server';

import { backendRequest } from '@/lib/api/backend';
import { slotsQuerySchema, slotsResultSchema } from '@/lib/api/contracts';
import { handleRouteError, jsonOk } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const query = slotsQuerySchema.parse({
      date: request.nextUrl.searchParams.get('date') ?? '',
      serviceIds: (request.nextUrl.searchParams.get('serviceIds') ?? '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      staffId: request.nextUrl.searchParams.get('staffId') ?? undefined,
      anyStaff: request.nextUrl.searchParams.get('anyStaff') === 'true'
    });

    const searchParams = new URLSearchParams({
      date: query.date,
      serviceIds: query.serviceIds.join(',')
    });

    if (query.staffId) {
      searchParams.set('staffId', query.staffId);
    }
    if (query.anyStaff !== undefined) {
      searchParams.set('anyStaff', String(query.anyStaff));
    }

    const payload = await backendRequest(`/appointments/slots?${searchParams.toString()}`, slotsResultSchema);
    return jsonOk(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
