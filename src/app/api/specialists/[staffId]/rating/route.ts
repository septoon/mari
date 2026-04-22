import { NextRequest } from 'next/server';

import { BackendError, submitSpecialistRating } from '@/lib/api/backend';
import { attachClientCookies, withClientAccess } from '@/lib/api/client-auth';
import { handleRouteError, jsonOk } from '@/lib/api/http';
import { submitSpecialistRatingInputSchema } from '@/lib/api/contracts';

type RouteContext = {
  params: Promise<{ staffId: string }>;
};

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { staffId } = await context.params;
    const body = submitSpecialistRatingInputSchema.parse(await request.json());

    try {
      const result = await withClientAccess(request, (accessToken) =>
        submitSpecialistRating(accessToken, staffId, body)
      );

      return attachClientCookies(jsonOk(result.data, 201), result.refreshed);
    } catch (error) {
      if (error instanceof BackendError && error.status === 401) {
        throw new BackendError('Оценку могут ставить только авторизованные пользователи.', {
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
