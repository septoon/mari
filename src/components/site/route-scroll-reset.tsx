'use client';

import { useLayoutEffect } from 'react';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation';

export function RouteScrollReset() {
  const pathname = usePathname();
  const modalSegment = useSelectedLayoutSegment('modal');

  useLayoutEffect(() => {
    if (!pathname || modalSegment || window.location.hash) {
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
  }, [modalSegment, pathname]);

  return null;
}
