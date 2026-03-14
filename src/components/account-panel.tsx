'use client';

import Link from 'next/link';
import { ImagePlus, LogOut, TicketX, Trash2, UserRound } from 'lucide-react';
import { startTransition, useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

import { useClientSession } from '@/components/client-session-provider';
import { ButtonLink } from '@/components/ui/button';
import { readApiOk } from '@/lib/api/browser';
import {
  cancelAppointmentResultSchema,
  clientAppointmentsSchema,
  clientProfileSchema
} from '@/lib/api/contracts';
import { formatBookingDateTime, formatCurrency, formatDuration } from '@/lib/format';

const clientResponseSchema = z.object({
  client: clientProfileSchema
});

const convertImageFileToWebp = async (file: File): Promise<File> => {
  const imageByType = file.type.startsWith('image/');
  const imageByName = /\.(png|jpe?g|gif|bmp|webp|avif|svg|tiff?|heic|heif)$/i.test(file.name);
  if (!imageByType && !imageByName) {
    throw new Error('Поддерживаются только изображения');
  }
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('Размер файла должен быть не больше 12 МБ');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Не удалось прочитать изображение'));
      img.src = objectUrl;
    });

    const maxSize = 2200;
    const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas не поддерживается в браузере');
    }

    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => {
          if (!value) {
            reject(new Error('Не удалось сконвертировать изображение в WEBP'));
            return;
          }
          resolve(value);
        },
        'image/webp',
        0.9
      );
    });

    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'avatar';
    return new File([blob], `${baseName}.webp`, {
      type: 'image/webp'
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

export function AccountPanel() {
  const { session, status, setAuthenticatedClient, setLoggedOut } = useClientSession();
  const [appointments, setAppointments] = useState<
    z.infer<typeof clientAppointmentsSchema>['items']
  >([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarSubmitting, setAvatarSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!session.authenticated) {
      startTransition(() => {
        setAppointments([]);
      });
      return;
    }

    setLoadingAppointments(true);

    try {
      const response = await fetch('/api/client/appointments?limit=10', {
        method: 'GET',
        cache: 'no-store'
      });
      const payload = await readApiOk(response, clientAppointmentsSchema);

      startTransition(() => {
        setAppointments(payload.items);
      });
    } catch (error) {
      console.error('[LOAD_APPOINTMENTS_FAILED]', error);
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось загрузить записи'
      });
    } finally {
      setLoadingAppointments(false);
    }
  }, [session.authenticated]);

  useEffect(() => {
    if (session.authenticated) {
      void loadAppointments();
    }
  }, [loadAppointments, session.authenticated]);

  const submitLogout = async () => {
    setSubmitting(true);
    setFeedback(null);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST'
      });
      setLoggedOut();
      setAppointments([]);
      setFeedback({
        type: 'success',
        text: 'Сеанс завершён.'
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось завершить сеанс'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/client/appointments/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      await readApiOk(response, cancelAppointmentResultSchema);

      setFeedback({
        type: 'success',
        text: 'Запись отменена.'
      });
      await loadAppointments();
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось отменить запись'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const submitAvatarUpload = async (file: File) => {
    setAvatarSubmitting(true);
    setFeedback(null);

    try {
      const webpFile = await convertImageFileToWebp(file);
      const formData = new FormData();
      formData.set('file', webpFile);

      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData
      });
      const payload = await readApiOk(response, clientResponseSchema);

      setAuthenticatedClient(payload.client);
      setFeedback({
        type: 'success',
        text: 'Аватарка обновлена.'
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось обновить аватарку'
      });
    } finally {
      setAvatarSubmitting(false);
    }
  };

  const submitAvatarDelete = async () => {
    setAvatarSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch('/api/auth/avatar', {
        method: 'DELETE'
      });
      const payload = await readApiOk(response, clientResponseSchema);

      setAuthenticatedClient(payload.client);
      setFeedback({
        type: 'success',
        text: 'Аватарка удалена.'
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось удалить аватарку'
      });
    } finally {
      setAvatarSubmitting(false);
    }
  };

  const permanentDiscount = session.client?.discount.permanentPercent ?? null;
  const appointmentCount = appointments.length;

  return (
    <section id="account" className="rounded-[2rem] border border-[color:var(--line)] bg-white/74 px-6 py-8 shadow-[0_25px_70px_rgba(12,77,85,0.06)] md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="section-kicker">Личный кабинет</p>
          <h2 className="section-title">Профиль, записи и история визитов.</h2>
          <p className="section-copy">
            Здесь можно посмотреть ближайшие визиты, обновить фото профиля, проверить скидку и при необходимости отменить запись.
          </p>
        </div>

        {session.authenticated ? (
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/contacts#booking" variant="secondary">
              Новая запись
            </ButtonLink>
            <button
              type="button"
              onClick={submitLogout}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line)] px-5 py-3 text-sm font-medium text-[color:var(--ink)] disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/account/login" size="sm">
              Войти
            </ButtonLink>
            <ButtonLink href="/account/register" variant="secondary" size="sm">
              Создать кабинет
            </ButtonLink>
          </div>
        )}
      </div>

      {feedback ? (
        <div
          className={`mt-6 rounded-[1.2rem] px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border border-[#86aa96]/40 bg-[#e3f0e8] text-[#21573b]'
              : 'border border-[#c4847d]/35 bg-[#f5dddb] text-[#7d3a37]'
          }`}
        >
          {feedback.text}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="mt-8 rounded-[1.5rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-6 py-8 text-sm text-[color:var(--ink-muted)]">
          Проверяю вход...
        </div>
      ) : status === 'ready' && !session.authenticated ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {[
            {
              href: '/account/login',
              title: 'Вход',
              description: 'Открыть историю визитов, будущие записи и профиль в личном кабинете.'
            },
            {
              href: '/account/register',
              title: 'Регистрация',
              description: 'Создать кабинет, чтобы сохранить данные и быстрее записываться на следующие визиты.'
            },
            {
              href: '/account/recover',
              title: 'Восстановление',
              description: 'Получить ссылку для смены пароля по телефону или email.'
            }
          ].map((item) => (
            <article
              key={item.href}
              className="rounded-[1.5rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(241,245,243,0.86))] p-5"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">{item.title}</p>
              <p className="mt-4 text-base leading-7 text-[color:var(--muted)]">{item.description}</p>
              <Link
                href={item.href}
                className="mt-6 inline-flex rounded-full border border-[color:var(--line)] bg-white px-5 py-3 text-sm font-medium text-[color:var(--ink)] transition hover:border-[color:var(--accent-strong)]"
              >
                Открыть страницу
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">Профиль</p>
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.8rem] border border-[color:var(--line)] bg-white text-[color:var(--ink)]">
                  {session.client?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={session.client.avatarUrl} alt={session.client?.name || 'Фото профиля'} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-10 w-10" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-3xl text-[color:var(--ink)]">
                    {session.client?.name || 'Клиент Mari'}
                  </h3>
                  <div className="mt-4 space-y-2 text-sm text-[color:var(--ink-muted)]">
                    <p>{session.client?.phoneE164}</p>
                    <p>{session.client?.email || 'Email пока не указан'}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <label className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm font-medium text-[color:var(--ink)] ${avatarSubmitting ? 'pointer-events-none opacity-60' : ''}`}>
                      <ImagePlus className="h-4 w-4" />
                      {session.client?.avatarUrl ? 'Заменить фото' : 'Добавить фото'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = '';
                          if (!file) {
                            return;
                          }
                          void submitAvatarUpload(file);
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={submitAvatarDelete}
                      disabled={avatarSubmitting || !session.client?.avatarUrl}
                      className="inline-flex items-center gap-2 rounded-full border border-[#c4847d]/35 bg-[#f5dddb] px-4 py-2 text-sm font-medium text-[#7d3a37] disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить фото
                    </button>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[color:var(--ink-muted)]">Лучше всего подойдёт светлое портретное фото</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(242,239,235,0.9),rgba(230,238,235,0.8))] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">Состояние</p>
                <h3 className="mt-3 font-serif text-3xl text-[color:var(--ink)]">Кабинет активен</h3>
                <p className="mt-3 text-sm leading-6 text-[color:var(--ink-muted)]">
                  В профиле сохранены ваши данные, история визитов и все основные действия для будущих записей.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">Сводка</p>
                <div className="mt-5 space-y-4 text-sm text-[color:var(--ink-muted)]">
                  <div className="flex items-center justify-between gap-4">
                    <span>Записей в истории</span>
                    <span className="font-medium text-[color:var(--ink)]">{appointmentCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Постоянная скидка</span>
                    <span className="font-medium text-[color:var(--ink)]">
                      {permanentDiscount ? `${permanentDiscount}%` : 'Пока нет'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Следующее действие</span>
                    <span className="font-medium text-[color:var(--ink)]">Новый визит</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">Мои записи</p>
                <h3 className="mt-2 font-serif text-3xl text-[color:var(--ink)]">История визитов</h3>
              </div>
              {loadingAppointments ? <span className="text-sm text-[color:var(--ink-muted)]">Обновляю...</span> : null}
            </div>

            {appointments.length === 0 ? (
              <div className="mt-5 rounded-[1.25rem] border border-dashed border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-8 text-sm text-[color:var(--ink-muted)]">
                Активных записей пока нет. Запланируйте первый визит через форму онлайн-записи.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {appointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-[1.35rem] border border-[color:var(--line)] bg-[color:var(--panel)] p-5"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--ink-muted)]">
                          {appointment.status}
                        </p>
                        <h4 className="mt-2 text-xl font-semibold text-[color:var(--ink)]">
                          {appointment.staff.name} · {formatBookingDateTime(appointment.startAt)}
                        </h4>
                        <p className="mt-3 text-sm leading-6 text-[color:var(--ink-muted)]">
                          {appointment.services
                            .map((service) => `${service.name} · ${formatDuration(service.durationSec)}`)
                            .join(' / ')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-[color:var(--line)] bg-white px-4 py-2 text-sm text-[color:var(--ink)]">
                          {formatCurrency(appointment.prices.finalTotal)}
                        </span>
                        {['PENDING', 'CONFIRMED'].includes(appointment.status) ? (
                          <button
                            type="button"
                            onClick={() => cancelAppointment(appointment.id)}
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-full bg-[#7b4642] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                          >
                            <TicketX className="h-4 w-4" />
                            Отменить
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
