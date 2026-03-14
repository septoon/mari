'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type ClipboardEvent, type FormEvent } from 'react';
import { z } from 'zod';

import {
  reachYandexMetrikaGoal,
  yandexMetrikaGoals
} from '@/components/analytics/yandex-metrika-goals';
import { useClientSession } from '@/components/client-session-provider';
import { readApiOk } from '@/lib/api/browser';
import { clientProfileSchema } from '@/lib/api/contracts';

const clientResponseSchema = z.object({
  client: clientProfileSchema
});

const resetResponseSchema = z.object({
  sent: z.boolean(),
  resetLink: z.string().url().optional()
});

const inputClassName =
  'w-full rounded-[1.3rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-4 py-3.5 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted-strong)] focus:border-[color:var(--accent-strong)]';
const phoneInputClassName = `${inputClassName} pl-14`;

const submitClassName =
  'inline-flex w-full items-center justify-center rounded-full bg-[color:var(--button-bg)] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-[color:var(--button-bg-hover)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60';

type Feedback = {
  type: 'error' | 'success';
  text: string;
} | null;

const normalizePhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if ((digits.startsWith('7') || digits.startsWith('8')) && digits.length > 10) {
    return digits.slice(1, 11);
  }

  return digits.slice(0, 10);
};

const normalizePhonePaste = (value: string) => {
  const digits = value.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return digits.slice(1);
  }

  return digits.length > 10 ? digits.slice(-10) : digits;
};

const toPhoneE164 = (phoneTail: string) => {
  const digits = phoneTail.trim();
  return digits ? `+7${digits}` : '';
};

function PhoneInput({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    onChange(normalizePhonePaste(event.clipboardData.getData('text')));
  };

  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-4 inline-flex items-center text-sm font-medium text-[color:var(--foreground)]">
        +7
      </span>
      <input
        value={value}
        onChange={(event) => onChange(normalizePhoneDigits(event.target.value))}
        onPaste={handlePaste}
        autoComplete="tel-national"
        inputMode="numeric"
        maxLength={10}
        placeholder="9780001818"
        className={phoneInputClassName}
      />
    </div>
  );
}

function FeedbackMessage({ feedback }: { feedback: Feedback }) {
  if (!feedback) {
    return null;
  }

  return (
    <div
      className={`rounded-[1.2rem] px-4 py-3 text-sm ${
        feedback.type === 'success'
          ? 'border border-[#86aa96]/40 bg-[#e3f0e8] text-[#21573b]'
          : 'border border-[#c4847d]/35 bg-[#f5dddb] text-[#7d3a37]'
      }`}
    >
      {feedback.text}
    </div>
  );
}

function AuthLinks({
  items
}: {
  items: Array<{ href: string; label: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-[color:var(--muted)]">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="underline decoration-[color:var(--line-strong)] underline-offset-4 transition hover:text-[color:var(--foreground)]"
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

function StateMessage({ text }: { text: string }) {
  return (
    <div className="rounded-[1.6rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-6 text-sm text-[color:var(--muted)]">
      {text}
    </div>
  );
}

export function AccountLoginForm() {
  const router = useRouter();
  const { session, status, setAuthenticatedClient } = useClientSession();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (status === 'ready' && session.authenticated) {
      router.replace('/account');
    }
  }, [router, session.authenticated, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone: toPhoneE164(form.phone),
          password: form.password
        })
      });
      const payload = await readApiOk(response, clientResponseSchema);

      reachYandexMetrikaGoal(yandexMetrikaGoals.loginSuccess);
      setAuthenticatedClient(payload.client);
      router.push('/account');
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось войти'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <StateMessage text="Проверяю вход..." />;
  }

  if (session.authenticated) {
    return <StateMessage text="Открываю личный кабинет..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Телефон</span>
        <PhoneInput
          value={form.phone}
          onChange={(phone) => setForm((current) => ({ ...current, phone }))}
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Пароль</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          autoComplete="current-password"
          placeholder="Ваш пароль"
          className={inputClassName}
        />
      </label>

      <FeedbackMessage feedback={feedback} />

      <button type="submit" disabled={submitting} className={submitClassName}>
        {submitting ? 'Вхожу...' : 'Войти'}
      </button>

      <AuthLinks
        items={[
          { href: '/account/register', label: 'Создать кабинет' },
          { href: '/account/recover', label: 'Восстановить доступ' }
        ]}
      />
    </form>
  );
}

export function AccountRegisterForm() {
  const router = useRouter();
  const { session, status, setAuthenticatedClient } = useClientSession();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (status === 'ready' && session.authenticated) {
      router.replace('/account');
    }
  }, [router, session.authenticated, status]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (form.password.length < 8) {
      setFeedback({
        type: 'error',
        text: 'Пароль должен быть не короче 8 символов.'
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name.trim() || undefined,
          email: form.email.trim() || undefined,
          phone: toPhoneE164(form.phone),
          password: form.password
        })
      });
      const payload = await readApiOk(response, clientResponseSchema);

      reachYandexMetrikaGoal(yandexMetrikaGoals.registerSuccess);
      setAuthenticatedClient(payload.client);
      router.push('/account');
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось создать кабинет'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <StateMessage text="Проверяю вход..." />;
  }

  if (session.authenticated) {
    return <StateMessage text="Открываю личный кабинет..." />;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Имя</span>
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          autoComplete="name"
          placeholder="Как к вам обращаться"
          className={inputClassName}
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          autoComplete="email"
          placeholder="name@example.com"
          className={inputClassName}
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Телефон</span>
        <PhoneInput
          value={form.phone}
          onChange={(phone) => setForm((current) => ({ ...current, phone }))}
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Пароль</span>
        <input
          type="password"
          value={form.password}
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          autoComplete="new-password"
          placeholder="Не короче 8 символов"
          className={inputClassName}
        />
      </label>

      <FeedbackMessage feedback={feedback} />

      <button type="submit" disabled={submitting} className={submitClassName}>
        {submitting ? 'Создаю кабинет...' : 'Создать кабинет'}
      </button>

      <AuthLinks
        items={[
          { href: '/account/login', label: 'Уже есть кабинет? Войти' },
          { href: '/account/recover', label: 'Восстановить доступ' }
        ]}
      />
    </form>
  );
}

export function AccountRecoverForm() {
  const [form, setForm] = useState({ email: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [resetLink, setResetLink] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.email.trim() && !form.phone.trim()) {
      setFeedback({
        type: 'error',
        text: 'Укажите email или телефон.'
      });
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    setResetLink(null);

    try {
      const response = await fetch('/api/auth/password/reset/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: form.email.trim() || undefined,
          phone: toPhoneE164(form.phone) || undefined
        })
      });
      const payload = await readApiOk(response, resetResponseSchema);

      reachYandexMetrikaGoal(yandexMetrikaGoals.passwordResetRequested, {
        has_email: Boolean(form.email.trim()),
        has_phone: Boolean(form.phone.trim())
      });
      setFeedback({
        type: 'success',
        text: payload.sent
          ? 'Если аккаунт найден, ссылка для смены пароля уже отправлена.'
          : 'Запрос принят.'
      });
      setResetLink(payload.resetLink ?? null);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось отправить ссылку'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Email</span>
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          autoComplete="email"
          placeholder="name@example.com"
          className={inputClassName}
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted-strong)]">Телефон</span>
        <PhoneInput
          value={form.phone}
          onChange={(phone) => setForm((current) => ({ ...current, phone }))}
        />
      </label>

      <FeedbackMessage feedback={feedback} />

      <button type="submit" disabled={submitting} className={submitClassName}>
        {submitting ? 'Отправляю...' : 'Отправить ссылку'}
      </button>

      {resetLink ? (
        <Link
          href={resetLink}
          className="text-sm text-[color:var(--foreground)] underline decoration-[color:var(--line-strong)] underline-offset-4"
        >
          Перейти к смене пароля
        </Link>
      ) : null}

      <AuthLinks
        items={[
          { href: '/account/login', label: 'Вернуться ко входу' },
          { href: '/account/register', label: 'Создать кабинет' }
        ]}
      />
    </form>
  );
}
