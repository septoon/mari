import { NextRequest } from 'next/server';

import { BackendError, fetchClientProfile, refreshClientSession } from '@/lib/api/backend';
import { applyClientAuthCookies, clearClientAuthCookies, isAccessExpired, readClientAuthSnapshot } from '@/lib/api/cookies';
import { handleRouteError, jsonOk } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const snapshot = readClientAuthSnapshot(request);

  if (snapshot.client && snapshot.accessToken && !isAccessExpired(snapshot.accessExpiresAt)) {
    try {
      const client = await fetchClientProfile(snapshot.accessToken);
      return jsonOk({
        authenticated: true,
        client
      });
    } catch (error) {
      if (!(error instanceof BackendError) || error.status !== 401) {
        return handleRouteError(error);
      }
    }
  }

  if (!snapshot.refreshToken) {
    return jsonOk({
      authenticated: false,
      client: null
    });
  }

  try {
    const refreshed = await refreshClientSession(snapshot.refreshToken);
    const response = jsonOk({
      authenticated: true,
      client: refreshed.client
    });
    applyClientAuthCookies(response, refreshed);
    return response;
  } catch (error) {
    if (error instanceof BackendError && error.status === 401) {
      const response = jsonOk({
        authenticated: false,
        client: null
      });
      clearClientAuthCookies(response);
      return response;
    }

    return handleRouteError(error);
  }
}
