import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { BackendError } from '@/lib/api/backend';

export const jsonOk = <T>(data: T, status = 200) =>
  NextResponse.json(
    {
      ok: true,
      data
    },
    { status }
  );

export const jsonFail = (status: number, message: string, code = 'REQUEST_FAILED', details?: unknown) =>
  NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {})
      }
    },
    { status }
  );

export const handleRouteError = (error: unknown) => {
  if (error instanceof BackendError) {
    return jsonFail(error.status, error.message, error.code ?? 'BACKEND_ERROR', error.details);
  }

  if (error instanceof ZodError) {
    return jsonFail(400, 'Invalid request payload', 'VALIDATION_ERROR', error.flatten());
  }

  if (error instanceof SyntaxError) {
    return jsonFail(400, 'Invalid JSON payload', 'INVALID_JSON');
  }

  console.error('[ROUTE_ERROR]', error);
  return jsonFail(500, 'Unexpected server error', 'INTERNAL_ERROR');
};
