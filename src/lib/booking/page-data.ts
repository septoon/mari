import 'server-only';

import { resolveBookingPageContent } from '@/lib/booking-page-content';
import { getLiveCatalog } from '@/lib/live-catalog';
import { getSiteOffers, getSitePrivacyPolicyContent } from '@/lib/site-content';

type SearchValue = string | string[] | undefined;

const firstValue = (value: SearchValue) => (Array.isArray(value) ? value[0] : value);

export const getBookingPageData = async (
  searchParams: Promise<Record<string, SearchValue>> | Record<string, SearchValue>
) => {
  const params = await searchParams;
  const serviceSlug = firstValue(params.service);
  const serviceId = firstValue(params.serviceId);
  const masterSlug = firstValue(params.master);
  const masterId = firstValue(params.masterId);
  const offerSlug = firstValue(params.offer);

  const [catalog, offers, privacyPolicy] = await Promise.all([
    getLiveCatalog(),
    getSiteOffers(),
    getSitePrivacyPolicyContent()
  ]);

  const service =
    (serviceId ? catalog.services.find((item) => item.id === serviceId) : null) ??
    (serviceSlug ? catalog.services.find((item) => item.slug === serviceSlug) : null) ??
    null;
  const master =
    (masterId ? catalog.specialists.find((item) => item.staffId === masterId) : null) ??
    (masterSlug ? catalog.specialists.find((item) => item.slug === masterSlug) : null) ??
    null;
  const offer = offerSlug ? offers.find((item) => item.slug === offerSlug) ?? null : null;

  return {
    catalog,
    privacyPolicy,
    bookingContent: resolveBookingPageContent(catalog.bootstrap.config.extra),
    context: {
      service,
      master,
      offer
    },
    initialSelection: {
      serviceId: service?.id ?? null,
      staffId: master?.staffId ?? null
    }
  };
};
