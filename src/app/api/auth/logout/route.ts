import { NextRequest } from 'next/server';
import { z } from 'zod';

import { backendRequest } from '@/lib/api/backend';
import { logoutInputSchema } from '@/lib/api/contracts';
import { clearClientAuthCookies, readClientAuthSnapshot } from '@/lib/api/cookies';
import { handleRouteError, jsonOk } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const snapshot = readClientAuthSnapshot(request);
    if (!snapshot.refreshToken) {
      const response = jsonOk({
        loggedOut: true
      });
      clearClientAuthCookies(response);
      return response;
    }

    const body = logoutInputSchema.parse({
      refreshToken: snapshot.refreshToken
    });

    await backendRequest('/auth/client/logout', z.object({ revoked: z.boolean() }), {
      init: {
        method: 'POST',
        body: JSON.stringify(body)
      }
    });

    const response = jsonOk({
      loggedOut: true
    });
    clearClientAuthCookies(response);

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
