import { NextRequest } from 'next/server';

import { backendRequest } from '@/lib/api/backend';
import { handleRouteError, jsonOk } from '@/lib/api/http';
import { scheduleDaysQuerySchema, scheduleDaysResultSchema } from '@/lib/api/contracts';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const query = scheduleDaysQuerySchema.parse({
      from: request.nextUrl.searchParams.get('from') ?? '',
      days: request.nextUrl.searchParams.get('days')
        ? Number(request.nextUrl.searchParams.get('days'))
        : undefined,
      staffId: request.nextUrl.searchParams.get('staffId') ?? undefined,
      anyStaff: request.nextUrl.searchParams.get('anyStaff') === 'true'
    });

    const searchParams = new URLSearchParams({
      from: query.from,
      days: String(query.days)
    });

    if (query.staffId) {
      searchParams.set('staffId', query.staffId);
    }
    if (query.anyStaff !== undefined) {
      searchParams.set('anyStaff', String(query.anyStaff));
    }

    const payload = await backendRequest(
      `/appointments/schedule-days?${searchParams.toString()}`,
      scheduleDaysResultSchema
    );

    return jsonOk(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
