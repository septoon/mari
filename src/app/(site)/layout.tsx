import type { ReactNode } from 'react';

import { ClientSessionProvider } from '@/components/client-session-provider';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ClientSessionProvider>
      <div className="min-h-screen">
        <SiteHeader />
        {children}
        <SiteFooter />
      </div>
    </ClientSessionProvider>
  );
}
