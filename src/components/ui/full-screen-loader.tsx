'use client';

import { Spiral } from 'ldrs/react';
import 'ldrs/react/Spiral.css';

type FullScreenLoaderProps = {
  label?: string;
  scope?: 'viewport' | 'site';
};

export function FullScreenLoader({
  label = 'Загрузка...',
  scope = 'viewport'
}: FullScreenLoaderProps) {
  const isSiteScope = scope === 'site';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`site-loader-backdrop fixed left-0 right-0 z-[120] flex items-center justify-center ${
        isSiteScope
          ? 'bottom-0 top-[var(--site-header-offset)] min-h-[calc(100dvh-var(--site-header-offset))]'
          : 'inset-0 min-h-screen w-screen'
      }`}
    >
      <div className="flex flex-col items-center gap-4 rounded-[1.5rem] px-6 py-5 text-center text-sm font-medium tracking-[0.18em] text-(--ink) uppercase shadow-[0_18px_38px_rgba(12,77,85,0.16)] backdrop-blur-sm">
        <Spiral size="64" speed="0.9" color="#245e63" />
        <span>{label}</span>
      </div>
    </div>
  );
}
