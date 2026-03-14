'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

export function RouteScrollReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (!pathname || window.location.hash) {
      return;
    }

    const root = document.documentElement;
    const previousRootBehavior = root.style.scrollBehavior;
    const previousBodyBehavior = document.body.style.scrollBehavior;

    root.style.scrollBehavior = 'auto';
    document.body.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {
      root.style.scrollBehavior = previousRootBehavior;
      document.body.style.scrollBehavior = previousBodyBehavior;
    });
  }, [pathname]);

  return null;
}
