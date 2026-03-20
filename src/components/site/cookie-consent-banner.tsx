'use client';

import Link from 'next/link';
import { useSyncExternalStore } from 'react';

import {
  type CookieConsentValue,
  COOKIE_CONSENT_EVENT,
  readCookieConsent,
  writeCookieConsent
} from '@/lib/cookie-consent';

type CookieConsentBannerProps = {
  title: string;
  description: string;
  acceptLabel: string;
  necessaryLabel: string;
};

export function CookieConsentBanner({
  title,
  description,
  acceptLabel,
  necessaryLabel
}: CookieConsentBannerProps) {
  const consent = useSyncExternalStore<CookieConsentValue | null | undefined>(
    (callback) => {
      window.addEventListener(COOKIE_CONSENT_EVENT, callback);
      return () => window.removeEventListener(COOKIE_CONSENT_EVENT, callback);
    },
    () => readCookieConsent(),
    () => undefined
  );

  if (typeof consent === 'undefined' || consent) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-[70] w-[min(100%-1.5rem,36rem)] -translate-x-1/2 rounded-[1.75rem] border border-(--line) bg-[rgba(255,252,247,0.96)] p-5 shadow-[0_28px_70px_rgba(24,32,36,0.18)] backdrop-blur-xl">
      <p className="text-sm font-semibold text-(--foreground)">{title}</p>
      <p className="mt-2 text-sm leading-6 text-(--muted)">{description}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => writeCookieConsent('accepted')}
          className="inline-flex items-center justify-center rounded-full bg-(--button-bg) px-4 py-2.5 text-sm font-medium text-white transition hover:bg-(--button-bg-hover)"
        >
          {acceptLabel}
        </button>
        <button
          type="button"
          onClick={() => writeCookieConsent('necessary')}
          className="inline-flex items-center justify-center rounded-full border border-(--line) bg-white px-4 py-2.5 text-sm font-medium text-(--foreground) transition hover:border-(--accent-strong)"
        >
          {necessaryLabel}
        </button>
        <Link
          href="/privacy-policy"
          className="inline-flex items-center justify-center rounded-full px-1 py-2.5 text-sm text-(--muted) underline decoration-(--line-strong) underline-offset-4 transition hover:text-(--foreground)"
        >
          Политика конфиденциальности
        </Link>
      </div>
    </div>
  );
}
