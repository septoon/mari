import { Suspense } from 'react';

import { FullScreenLoader } from '@/components/ui/full-screen-loader';
import { ResetPasswordForm } from '@/components/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<FullScreenLoader label="Загружаю форму восстановления..." />}
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
