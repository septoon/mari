import { Suspense } from 'react';

import { ResetPasswordForm } from '@/components/reset-password-form';

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 text-sm text-[color:var(--ink-muted)] sm:px-6 lg:px-8">
          Загружаю форму восстановления...
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
