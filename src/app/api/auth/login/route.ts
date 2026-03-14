import { NextRequest } from 'next/server';

import { backendRequest } from '@/lib/api/backend';
import { authInputSchema, authPayloadSchema } from '@/lib/api/contracts';
import { applyClientAuthCookies } from '@/lib/api/cookies';
import { handleRouteError, jsonOk } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = authInputSchema.parse(await request.json());
    const payload = await backendRequest('/auth/client/login', authPayloadSchema, {
      init: {
        method: 'POST',
        body: JSON.stringify(body)
      }
    });

    const response = jsonOk({
      client: payload.client
    });
    applyClientAuthCookies(response, payload);

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
