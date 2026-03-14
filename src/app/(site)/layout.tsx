import type { ReactNode } from 'react';

import { ClientSessionProvider } from '@/components/client-session-provider';
import { RouteScrollReset } from '@/components/site/route-scroll-reset';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ClientSessionProvider>
      <div className="min-h-screen">
        <RouteScrollReset />
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </ClientSessionProvider>
  );
}
