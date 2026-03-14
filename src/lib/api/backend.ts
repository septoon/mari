import 'server-only';

import { z } from 'zod';

import {
  apiErrorSchema,
  authPayloadSchema,
  buildApiOkSchema,
  clientAppointmentsSchema,
  clientBootstrapSchema,
  clientProfileSchema,
  passwordResetRequestResultSchema,
  serviceListSchema,
  slotsResultSchema,
  type ClientBootstrap,
  type Service
} from '@/lib/api/contracts';

const backendBaseUrl = (process.env.MARI_SERVER_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const webAppVersion = process.env.NEXT_PUBLIC_APP_VERSION?.trim() || undefined;

export class BackendError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, options?: { status?: number; code?: string; details?: unknown }) {
    super(message);
    this.name = 'BackendError';
    this.status = options?.status ?? 500;
    this.code = options?.code;
    this.details = options?.details;
  }
}

type BackendRequestOptions = {
  authToken?: string;
  init?: RequestInit;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

const buildUrl = (path: string) => `${backendBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;

export const backendRequest = async <T extends z.ZodTypeAny>(
  path: string,
  schema: T,
  options: BackendRequestOptions = {}
): Promise<z.infer<T>> => {
  const headers = new Headers(options.init?.headers);

  if (options.authToken) {
    headers.set('Authorization', `Bearer ${options.authToken}`);
  }

  if (options.init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path), {
      ...options.init,
      headers,
      cache: options.cache ?? 'no-store',
      next: options.next
    });
  } catch (error) {
    throw new BackendError(`Не удалось подключиться к mari-server: ${backendBaseUrl}`, {
      status: 502,
      code: 'BACKEND_UNAVAILABLE',
      details: error instanceof Error ? error.message : error
    });
  }

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

const buildBootstrapPath = () => {
  const searchParams = new URLSearchParams({ platform: 'web' });
  if (webAppVersion) {
    searchParams.set('appVersion', webAppVersion);
  }

  return `/client-front/bootstrap?${searchParams.toString()}`;
};

const createDefaultBootstrap = (): ClientBootstrap => ({
  version: 0,
  publishedAt: null,
  config: {
    brandName: 'MARI',
    legalName: 'Mari Beauty Salon',
    minAppVersionIos: null,
    minAppVersionAndroid: null,
    maintenanceMode: false,
    maintenanceMessage: null,
    featureFlags: {},
    featureFlagState: {},
    contacts: [],
    extra: {}
  },
  blocks: [],
  specialists: []
});

export const getLandingData = async (): Promise<{
  bootstrap: ClientBootstrap;
  services: Service[];
  connectivity: { bootstrap: boolean; services: boolean };
}> => {
  const [bootstrapResult, servicesResult] = await Promise.allSettled([
    backendRequest(buildBootstrapPath(), clientBootstrapSchema, {
      cache: 'force-cache',
      next: { revalidate: 60 }
    }),
    backendRequest('/services/public', serviceListSchema, {
      cache: 'force-cache',
      next: { revalidate: 60 }
    })
  ]);

  const bootstrap = bootstrapResult.status === 'fulfilled' ? bootstrapResult.value : createDefaultBootstrap();
  const services = servicesResult.status === 'fulfilled' ? servicesResult.value.items : [];

  return {
    bootstrap,
    services,
    connectivity: {
      bootstrap: bootstrapResult.status === 'fulfilled',
      services: servicesResult.status === 'fulfilled'
    }
  };
};

export const refreshClientSession = async (refreshToken: string) =>
  backendRequest('/auth/client/refresh', authPayloadSchema, {
    init: {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    }
  });

export const fetchClientProfile = async (authToken: string) =>
  backendRequest('/auth/client/profile', z.object({ client: clientProfileSchema }), {
    authToken
  }).then((payload) => payload.client);

export const requestClientPasswordReset = async (payload: { email?: string; phone?: string }) =>
  backendRequest('/auth/client/password/reset/request', passwordResetRequestResultSchema, {
    init: {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  });

export const fetchClientAppointments = async (authToken: string, page = 1, limit = 10) =>
  backendRequest(`/client/appointments?page=${page}&limit=${limit}`, clientAppointmentsSchema, {
    authToken
  });

export const fetchSlots = async (
  authToken: string | undefined,
  path: string
) => {
  return backendRequest(path, slotsResultSchema, {
    authToken
  });
};
