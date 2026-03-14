import { NextRequest } from 'next/server';

import { requestClientPasswordReset } from '@/lib/api/backend';
import { passwordResetRequestInputSchema } from '@/lib/api/contracts';
import { handleRouteError, jsonOk } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = passwordResetRequestInputSchema.parse(await request.json());
    const payload = await requestClientPasswordReset(body);

    return jsonOk(payload);
  } catch (error) {
    return handleRouteError(error);
  }
}
