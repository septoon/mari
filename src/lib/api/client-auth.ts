import type { NextRequest, NextResponse } from 'next/server';

import { BackendError, refreshClientSession } from '@/lib/api/backend';
import { applyClientAuthCookies, isAccessExpired, readClientAuthSnapshot } from '@/lib/api/cookies';

type RefreshedAuth = Awaited<ReturnType<typeof refreshClientSession>>;

export const withClientAccess = async <T>(
  request: NextRequest,
  execute: (accessToken: string) => Promise<T>
): Promise<{ data: T; refreshed?: RefreshedAuth }> => {
  const snapshot = readClientAuthSnapshot(request);
  let refreshed: RefreshedAuth | undefined;
  let accessToken = snapshot.accessToken;

  if (!accessToken || isAccessExpired(snapshot.accessExpiresAt)) {
    if (!snapshot.refreshToken) {
      throw new BackendError('Client authentication required', {
        status: 401,
        code: 'UNAUTHORIZED'
      });
    }

    refreshed = await refreshClientSession(snapshot.refreshToken);
    accessToken = refreshed.tokens.accessToken;
  }

  try {
    return {
      data: await execute(accessToken),
      refreshed
    };
  } catch (error) {
    if (!(error instanceof BackendError) || error.status !== 401 || !snapshot.refreshToken || refreshed) {
      throw error;
    }

    refreshed = await refreshClientSession(snapshot.refreshToken);
    return {
      data: await execute(refreshed.tokens.accessToken),
      refreshed
    };
  }
};

export const attachClientCookies = <T extends NextResponse>(response: T, refreshed?: RefreshedAuth) => {
  if (refreshed) {
    applyClientAuthCookies(response, refreshed);
  }
  return response;
};
