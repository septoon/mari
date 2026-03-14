import type { NextRequest, NextResponse } from 'next/server';

import { clientProfileSchema, type ClientProfile } from '@/lib/api/contracts';

const ACCESS_COOKIE = 'mari.access';
const REFRESH_COOKIE = 'mari.refresh';
const PROFILE_COOKIE = 'mari.client';
const ACCESS_EXPIRES_AT_COOKIE = 'mari.access-exp';
const refreshMaxAgeSec = 60 * 60 * 24 * 30;

const isProduction = process.env.NODE_ENV === 'production';

const commonCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProduction,
  path: '/'
};

const encodeProfile = (value: ClientProfile) =>
  Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');

const decodeProfile = (value: string): ClientProfile | null => {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
    const checked = clientProfileSchema.safeParse(parsed);
    return checked.success ? checked.data : null;
  } catch {
    return null;
  }
};

export const applyClientAuthCookies = (
  response: NextResponse,
  payload: {
    tokens: { accessToken: string; refreshToken: string; expiresInSec: number };
    client: ClientProfile;
  }
) => {
  const accessExpiresAt = new Date(Date.now() + payload.tokens.expiresInSec * 1000);

  response.cookies.set(ACCESS_COOKIE, payload.tokens.accessToken, {
    ...commonCookieOptions,
    maxAge: payload.tokens.expiresInSec
  });
  response.cookies.set(REFRESH_COOKIE, payload.tokens.refreshToken, {
    ...commonCookieOptions,
    maxAge: refreshMaxAgeSec
  });
  response.cookies.set(PROFILE_COOKIE, encodeProfile(payload.client), {
    ...commonCookieOptions,
    maxAge: refreshMaxAgeSec
  });
  response.cookies.set(ACCESS_EXPIRES_AT_COOKIE, accessExpiresAt.toISOString(), {
    ...commonCookieOptions,
    maxAge: refreshMaxAgeSec
  });
};

export const applyClientProfileCookie = (response: NextResponse, client: ClientProfile) => {
  response.cookies.set(PROFILE_COOKIE, encodeProfile(client), {
    ...commonCookieOptions,
    maxAge: refreshMaxAgeSec
  });
};

export const clearClientAuthCookies = (response: NextResponse) => {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, PROFILE_COOKIE, ACCESS_EXPIRES_AT_COOKIE]) {
    response.cookies.set(name, '', {
      ...commonCookieOptions,
      maxAge: 0
    });
  }
};

export const readClientAuthSnapshot = (request: NextRequest) => ({
  accessToken: request.cookies.get(ACCESS_COOKIE)?.value,
  refreshToken: request.cookies.get(REFRESH_COOKIE)?.value,
  accessExpiresAt: request.cookies.get(ACCESS_EXPIRES_AT_COOKIE)?.value,
  client: request.cookies.get(PROFILE_COOKIE)?.value
    ? decodeProfile(request.cookies.get(PROFILE_COOKIE)!.value)
    : null
});

export const isAccessExpired = (value: string | undefined) => {
  if (!value) return true;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return true;
  return timestamp <= Date.now() + 30_000;
};
