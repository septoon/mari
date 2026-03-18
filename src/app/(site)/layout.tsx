import type { ReactNode } from 'react';

import { ClientSessionProvider } from '@/components/client-session-provider';
import { CookieConsentBanner } from '@/components/site/cookie-consent-banner';
import { RouteScrollReset } from '@/components/site/route-scroll-reset';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { getLiveCatalog } from '@/lib/live-catalog';
import { getSitePrivacyPolicyContent } from '@/lib/site-content';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({
  children,
  modal
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  const [catalog, privacyPolicy] = await Promise.all([
    getLiveCatalog(),
    getSitePrivacyPolicyContent()
  ]);

  return (
    <ClientSessionProvider>
      <div className="min-h-screen">
        <RouteScrollReset />
        <SiteHeader salon={catalog.salon} />
        {children}
        <SiteFooter salon={catalog.salon} />
        <CookieConsentBanner
          title={privacyPolicy.cookieBannerTitle}
          description={privacyPolicy.cookieBannerDescription}
          acceptLabel={privacyPolicy.cookieBannerAcceptLabel}
          necessaryLabel={privacyPolicy.cookieBannerNecessaryLabel}
        />
        {modal}
      </div>
    </ClientSessionProvider>
  );
}
