'use client';

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export const yandexMetrikaGoals = {
  bookingCreated: 'booking_created',
  loginSuccess: 'login_success',
  registerSuccess: 'register_success',
  passwordResetRequested: 'password_reset_requested'
} as const;

const METRIKA_ID = 107707126;

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
    if (typeof window.ym === 'function') {
      window.ym(METRIKA_ID, 'reachGoal', goal, params, callback);
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
