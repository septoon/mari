'use client';

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
    __YANDEX_METRIKA_ID__?: number;
  }
}

export const yandexMetrikaGoals = {
  bookingCreated: 'booking_created',
  loginSuccess: 'login_success',
  registerSuccess: 'register_success',
  passwordResetRequested: 'password_reset_requested'
} as const;

export const reachYandexMetrikaGoal = (
  goal: (typeof yandexMetrikaGoals)[keyof typeof yandexMetrikaGoals],
  params?: Record<string, unknown>,
  callback?: () => void
) => {
  if (typeof window === 'undefined') {
    return;
  }

  let attempts = 0;

  const send = () => {
    const metrikaId = window.__YANDEX_METRIKA_ID__;

    if (metrikaId && typeof window.ym === 'function') {
      window.ym(metrikaId, 'reachGoal', goal, params, callback);
      return;
    }

    if (attempts >= 20) {
      return;
    }

    attempts += 1;
    window.setTimeout(send, 150);
  };

  send();
};
