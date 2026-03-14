import { NextRequest } from 'next/server';
import { z } from 'zod';

import { BackendError, backendRequest } from '@/lib/api/backend';
import { withClientAccess } from '@/lib/api/client-auth';
import { applyClientAuthCookies, applyClientProfileCookie } from '@/lib/api/cookies';
import { apiErrorSchema, buildApiOkSchema, clientProfileSchema } from '@/lib/api/contracts';
import { handleRouteError, jsonFail, jsonOk } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

const backendBaseUrl = (process.env.MARI_SERVER_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const avatarResponseSchema = z.object({
  client: clientProfileSchema
});

const parseBackendPayload = async <T extends z.ZodTypeAny>(response: Response, schema: T): Promise<z.infer<T>> => {
  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(payload);
    if (parsedError.success) {
      throw new BackendError(parsedError.data.error.message, {
        status: response.status,
        code: parsedError.data.error.code,
        details: parsedError.data.error.details
      });
    }

    throw new BackendError(`Backend request failed with status ${response.status}`, {
      status: response.status,
      details: payload
    });
  }

  const parsed = buildApiOkSchema(schema).safeParse(payload);
  if (!parsed.success) {
    throw new BackendError('Backend response contract mismatch', {
      status: response.status,
      details: parsed.error.flatten()
    });
  }

  return (parsed.data as { data: z.infer<T> }).data;
};

export async function POST(request: NextRequest) {
  try {
    const incoming = await request.formData();
    const file = incoming.get('file');

    if (!(file instanceof File)) {
      return jsonFail(400, 'file is required', 'VALIDATION_ERROR');
    }

    const { data, refreshed } = await withClientAccess(request, async (accessToken) => {
      const formData = new FormData();
      formData.set('file', file);

      const response = await fetch(`${backendBaseUrl}/auth/client/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
        body: formData,
        cache: 'no-store'
      });

      return parseBackendPayload(response, avatarResponseSchema);
    });

    const response = jsonOk(data);
    if (refreshed) {
      applyClientAuthCookies(response, {
        tokens: refreshed.tokens,
        client: data.client
      });
    } else {
      applyClientProfileCookie(response, data.client);
    }

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { data, refreshed } = await withClientAccess(request, async (accessToken) =>
      backendRequest('/auth/client/avatar', avatarResponseSchema, {
        authToken: accessToken,
        init: {
          method: 'DELETE'
        }
      })
    );

    const response = jsonOk(data);
    if (refreshed) {
      applyClientAuthCookies(response, {
        tokens: refreshed.tokens,
        client: data.client
      });
    } else {
      applyClientProfileCookie(response, data.client);
    }

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
