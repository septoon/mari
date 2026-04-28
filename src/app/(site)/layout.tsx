import type { ReactNode } from 'react';

import { ClientSessionProvider } from '@/components/client-session-provider';
import { CookieConsentBanner } from '@/components/site/cookie-consent-banner';
import { FloatingContactButton } from '@/components/site/floating-contact-button';
import { RouteScrollReset } from '@/components/site/route-scroll-reset';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { getLiveCatalog } from '@/lib/live-catalog';
import { getVisibleSiteFooterNav, getVisibleSiteFooterUtilityNav, getVisibleSiteNav } from '@/lib/site';
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
  const navItems = getVisibleSiteNav(catalog.bootstrap.config.extra);
  const footerNav = getVisibleSiteFooterNav(catalog.bootstrap.config.extra);
  const footerUtilityNav = getVisibleSiteFooterUtilityNav(catalog.bootstrap.config.extra);

  return (
    <ClientSessionProvider>
      <div className="min-h-screen">
        <RouteScrollReset />
        <SiteHeader salon={catalog.salon} navItems={navItems} />
        {children}
        <SiteFooter salon={catalog.salon} footerNav={footerNav} utilityNav={footerUtilityNav} />
        <FloatingContactButton phoneHref={catalog.salon.phoneHref} />
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
