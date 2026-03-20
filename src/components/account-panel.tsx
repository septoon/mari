'use client';

import { ImagePlus, LogOut, TicketX, Trash2, UserRound } from 'lucide-react';
import { startTransition, useCallback, useEffect, useState } from 'react';
import { z } from 'zod';

import { useClientSession } from '@/components/client-session-provider';
import { ButtonLink } from '@/components/ui/button';
import { LoadingLabel } from '@/components/ui/loading-indicator';
import { ClientApiError, readApiOk } from '@/lib/api/browser';
import {
  cancelAppointmentResultSchema,
  clientAppointmentsSchema,
  clientProfileSchema,
} from '@/lib/api/contracts';
import { CANCELLABLE_APPOINTMENT_STATUSES, formatAppointmentStatus } from '@/lib/appointment-labels';
import { formatBookingDateTime, formatCurrency, formatDuration } from '@/lib/format';

const clientResponseSchema = z.object({
  client: clientProfileSchema,
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
        0.9,
      );
    });

    const baseName = file.name.replace(/\.[^/.]+$/, '') || 'avatar';
    return new File([blob], `${baseName}.webp`, {
      type: 'image/webp',
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
  const [currentTimestamp, setCurrentTimestamp] = useState<number | null>(null);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [logoutSubmitting, setLogoutSubmitting] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);
  const [avatarAction, setAvatarAction] = useState<'upload' | 'delete' | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null,
  );

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
        cache: 'no-store',
      });
      const payload = await readApiOk(response, clientAppointmentsSchema);

      startTransition(() => {
        setAppointments(payload.items);
      });
    } catch (error) {
      console.error('[LOAD_APPOINTMENTS_FAILED]', error);
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось загрузить записи',
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

  useEffect(() => {
    setCurrentTimestamp(Date.now());

    const intervalId = window.setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const canCancelAppointment = useCallback(
    (appointment: z.infer<typeof clientAppointmentsSchema>['items'][number]) => {
      if (!CANCELLABLE_APPOINTMENT_STATUSES.has(appointment.status)) {
        return false;
      }

      if (currentTimestamp === null) {
        return false;
      }

      return new Date(appointment.startAt).getTime() > currentTimestamp;
    },
    [currentTimestamp],
  );

  const submitLogout = async () => {
    setLogoutSubmitting(true);
    setFeedback(null);

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setLoggedOut();
      setAppointments([]);
      setFeedback({
        type: 'success',
        text: 'Сеанс завершён.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось завершить сеанс',
      });
    } finally {
      setLogoutSubmitting(false);
    }
  };

  const cancelAppointment = async (id: string) => {
    setCancellingAppointmentId(id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/client/appointments/${id}/cancel`, {
        method: 'POST',
      });
      await readApiOk(response, cancelAppointmentResultSchema);

      setFeedback({
        type: 'success',
        text: 'Запись отменена.',
      });
      await loadAppointments();
    } catch (error) {
      const apiError = error as ClientApiError;
      setFeedback({
        type: 'error',
        text:
          apiError?.status === 422
            ? 'Эту запись уже нельзя отменить онлайн. Свяжитесь с салоном, если нужна помощь.'
            : error instanceof Error
              ? error.message
              : 'Не удалось отменить запись',
      });
      await loadAppointments();
    } finally {
      setCancellingAppointmentId(null);
    }
  };

  const submitAvatarUpload = async (file: File) => {
    setAvatarAction('upload');
    setFeedback(null);

    try {
      const webpFile = await convertImageFileToWebp(file);
      const formData = new FormData();
      formData.set('file', webpFile);

      const response = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      });
      const payload = await readApiOk(response, clientResponseSchema);

      setAuthenticatedClient(payload.client);
      setFeedback({
        type: 'success',
        text: 'Аватарка обновлена.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось обновить аватарку',
      });
    } finally {
      setAvatarAction(null);
    }
  };

  const submitAvatarDelete = async () => {
    setAvatarAction('delete');
    setFeedback(null);

    try {
      const response = await fetch('/api/auth/avatar', {
        method: 'DELETE',
      });
      const payload = await readApiOk(response, clientResponseSchema);

      setAuthenticatedClient(payload.client);
      setFeedback({
        type: 'success',
        text: 'Аватарка удалена.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error instanceof Error ? error.message : 'Не удалось удалить аватарку',
      });
    } finally {
      setAvatarAction(null);
    }
  };

  const permanentDiscount = session.client?.discount.permanentPercent ?? null;
  const appointmentCount = appointments.length;
  const avatarSubmitting = avatarAction !== null;

  return (
    <section
      id="account"
      className="rounded-[2rem] border border-(--line) bg-white/74 px-6 py-8 shadow-[0_25px_70px_rgba(12,77,85,0.06)] md:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="section-kicker">Личный кабинет</p>
          <h2 className="section-title">
            {session.authenticated ? 'Профиль, записи и история визитов.' : 'Войдите или создайте кабинет.'}
          </h2>
          <p className="section-copy">
            {session.authenticated
              ? 'Здесь можно посмотреть ближайшие визиты, обновить фото профиля, проверить скидку и при необходимости отменить запись.'
              : 'После входа будут доступны профиль, история визитов, записи и все основные действия в личном кабинете.'}
          </p>
        </div>

        {session.authenticated ? (
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/booking" variant="secondary">
              Новая запись
            </ButtonLink>
            <button
              type="button"
              onClick={submitLogout}
              disabled={logoutSubmitting || Boolean(cancellingAppointmentId)}
              aria-busy={logoutSubmitting}
              className="inline-flex items-center gap-2 rounded-full border border-(--line) px-5 py-3 text-sm font-medium text-(--ink) disabled:opacity-60">
              {logoutSubmitting ? (
                <LoadingLabel label="Выхожу..." size="sm" spinnerClassName="text-(--ink)" />
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  Выйти
                </>
              )}
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
          }`}>
          {feedback.text}
        </div>
      ) : null}

      {status === 'loading' ? (
        <div className="mt-8 rounded-[1.5rem] border border-(--line) bg-(--panel) px-6 py-8 text-sm text-(--ink-muted)">
          <LoadingLabel
            label="Проверяю вход..."
            className="text-(--ink-muted)"
            spinnerClassName="text-(--ink-muted)"
          />
        </div>
      ) : !session.authenticated ? null : (
        <div className="mt-8 space-y-5">
          <div className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
            <div className="rounded-[1.5rem] border border-(--line) bg-(--panel) p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-(--ink-muted)">
                Профиль
              </p>
              <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.8rem] border border-(--line) bg-white text-(--ink)">
                  {session.client?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={session.client.avatarUrl}
                      alt={session.client?.name || 'Фото профиля'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-10 w-10" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-3xl text-(--ink)">
                    {session.client?.name || 'Клиент Mari'}
                  </h3>
                  <div className="mt-4 space-y-2 text-sm text-(--ink-muted)">
                    <p>{session.client?.phoneE164}</p>
                    <p>{session.client?.email || 'Email пока не указан'}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <label
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-(--line) bg-white px-4 py-2 text-sm font-medium text-(--ink) ${avatarSubmitting ? 'pointer-events-none opacity-60' : ''}`}>
                      {avatarAction === 'upload' ? (
                        <LoadingLabel label="Обновляю фото..." size="sm" spinnerClassName="text-(--ink)" />
                      ) : (
                        <>
                          <ImagePlus className="h-4 w-4" />
                          {session.client?.avatarUrl ? 'Заменить фото' : 'Добавить фото'}
                        </>
                      )}
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
                      aria-busy={avatarAction === 'delete'}
                      className="inline-flex items-center gap-2 rounded-full border border-[#c4847d]/35 bg-[#f5dddb] px-4 py-2 text-sm font-medium text-[#7d3a37] disabled:opacity-60">
                      {avatarAction === 'delete' ? (
                        <LoadingLabel label="Удаляю фото..." size="sm" spinnerClassName="text-[#7d3a37]" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Удалить фото
                        </>
                      )}
                    </button>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-(--ink-muted)">
                    Лучше всего подойдёт светлое портретное фото
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-(--line) bg-[linear-gradient(180deg,rgba(242,239,235,0.9),rgba(230,238,235,0.8))] p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-(--ink-muted)">
                  Состояние
                </p>
                <h3 className="mt-3 font-serif text-3xl text-(--ink)">
                  Кабинет активен
                </h3>
                <p className="mt-3 text-sm leading-6 text-(--ink-muted)">
                  В профиле сохранены ваши данные, история визитов и все основные действия для
                  будущих записей.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-(--line) bg-white p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-(--ink-muted)">
                  Сводка
                </p>
                <div className="mt-5 space-y-4 text-sm text-(--ink-muted)">
                  <div className="flex items-center justify-between gap-4">
                    <span>Записей в истории</span>
                    <span className="font-medium text-(--ink)">{appointmentCount}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Постоянная скидка</span>
                    <span className="font-medium text-(--ink)">
                      {permanentDiscount ? `${permanentDiscount}%` : 'Пока нет'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Следующее действие</span>
                    <span className="font-medium text-(--ink)">Новый визит</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-(--line) bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-(--ink-muted)">
                  Мои записи
                </p>
                <h3 className="mt-2 font-serif text-3xl text-(--ink)">
                  История визитов
                </h3>
              </div>
              {loadingAppointments ? (
                <LoadingLabel
                  label="Обновляю..."
                  size="sm"
                  className="text-sm text-(--ink-muted)"
                  spinnerClassName="text-(--ink-muted)"
                />
              ) : null}
            </div>

            {appointments.length === 0 ? (
              <div className="mt-5 rounded-[1.25rem] border border-dashed border-(--line) bg-(--panel) px-5 py-8 text-sm text-(--ink-muted)">
                Активных записей пока нет. Запланируйте первый визит через форму онлайн-записи.
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {appointments.map((appointment) => (
                  <article
                    key={appointment.id}
                    className="rounded-[1.35rem] border border-(--line) bg-(--panel) p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-medium text-(--ink-muted)">
                          {formatAppointmentStatus(appointment.status)}
                        </p>
                        <h4 className="mt-2 text-xl font-semibold text-(--ink)">
                          {appointment.staff.name} · {formatBookingDateTime(appointment.startAt)}
                        </h4>
                        <p className="mt-3 text-sm leading-6 text-(--ink-muted)">
                          {appointment.services
                            .map(
                              (service) =>
                                `${service.name} · ${formatDuration(service.durationSec)}`,
                            )
                            .join(' / ')}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-full border border-(--line) bg-white px-4 py-2 text-sm text-(--ink)">
                          {formatCurrency(appointment.prices.finalTotal)}
                        </span>
                        {canCancelAppointment(appointment) ? (
                          <button
                            type="button"
                            onClick={() => cancelAppointment(appointment.id)}
                            disabled={logoutSubmitting || Boolean(cancellingAppointmentId)}
                            aria-busy={cancellingAppointmentId === appointment.id}
                            className="inline-flex items-center gap-2 rounded-full bg-[#7b4642] px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
                            {cancellingAppointmentId === appointment.id ? (
                              <LoadingLabel label="Отменяю..." size="sm" />
                            ) : (
                              <>
                                <TicketX className="h-4 w-4" />
                                Отменить
                              </>
                            )}
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
