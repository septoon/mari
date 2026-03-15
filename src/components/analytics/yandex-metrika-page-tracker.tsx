'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function YandexMetrikaPageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const lastTrackedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const trackPageView = () => {
      if (cancelled) {
        return;
      }

      const metrikaId = window.__YANDEX_METRIKA_ID__;

      if (!metrikaId || typeof window.ym !== 'function') {
        if (attempts < 20) {
          attempts += 1;
          window.setTimeout(trackPageView, 150);
        }
        return;
      }

      const currentUrl = window.location.href;
      if (lastTrackedUrlRef.current === currentUrl) {
        return;
      }

      window.ym(metrikaId, 'hit', currentUrl, {
        referer: lastTrackedUrlRef.current ?? document.referrer,
        title: document.title
      });

      lastTrackedUrlRef.current = currentUrl;
    };

    trackPageView();

    return () => {
      cancelled = true;
    };
  }, [pathname, search]);

  return null;
}
