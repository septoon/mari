import { z } from 'zod';

import { apiErrorSchema, buildApiOkSchema } from '@/lib/api/contracts';

export class ClientApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = 'ClientApiError';
    this.status = options?.status ?? 500;
    this.code = options?.code;
    this.details = options?.details;
  }
}

export const readApiOk = async <T extends z.ZodTypeAny>(response: Response, schema: T): Promise<z.infer<T>> => {
  const payload = await response.json();

  if (!response.ok) {
    const parsedError = apiErrorSchema.safeParse(payload);
    if (parsedError.success) {
      throw new ClientApiError(parsedError.data.error.message, {
        status: response.status,
        code: parsedError.data.error.code,
        details: parsedError.data.error.details
      });
    }

    throw new ClientApiError(`Request failed with status ${response.status}`, {
      status: response.status,
      details: payload
    });
  }

  return (buildApiOkSchema(schema).parse(payload) as { data: z.infer<T> }).data;
};
