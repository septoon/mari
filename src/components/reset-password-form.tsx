'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { z } from 'zod';

import { readApiOk } from '@/lib/api/browser';
import { clientProfileSchema } from '@/lib/api/contracts';

const responseSchema = z.object({
  client: clientProfileSchema
});

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError('В ссылке нет токена восстановления.');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен быть не короче 8 символов.');
      return;
    }

    if (password !== confirm) {
      setError('Пароли не совпадают.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/password/reset/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword: password
        })
      });

      const payload = await readApiOk(response, responseSchema);
      setMessage(`Пароль обновлён. Вы уже вошли в кабинет под номером ${payload.client.phoneE164}.`);
      setPassword('');
      setConfirm('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Не удалось обновить пароль');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[0.9fr_1.1fr]">

        <section className="rounded-[2rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(238,243,241,0.82))] p-8 shadow-[0_25px_70px_rgba(12,77,85,0.08)]">
          <p className="section-kicker">Смена пароля</p>
          <h1 className="section-title">Обновить доступ к кабинету.</h1>
          <p className="section-copy">
            Придумайте новый пароль для кабинета. После сохранения вы сразу сможете продолжить работу с записями.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 grid gap-4">
            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">Новый пароль</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--ink)]"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">Повторите пароль</span>
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[color:var(--ink)]"
              />
            </label>

            {error ? (
              <div className="rounded-[1.2rem] border border-[#c4847d]/35 bg-[#f5dddb] px-4 py-3 text-sm text-[#7d3a37]">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="rounded-[1.2rem] border border-[#86aa96]/40 bg-[#e3f0e8] px-4 py-3 text-sm text-[#21573b]">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full bg-[color:var(--button-bg)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[color:var(--button-bg-hover)] disabled:opacity-60"
            >
              {submitting ? 'Обновляю пароль...' : 'Сохранить новый пароль'}
            </button>
          </form>

          <div className="mt-6 text-sm text-[color:var(--ink-muted)]">
            <Link href="/account/login" className="underline underline-offset-4">
              Вернуться ко входу
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
