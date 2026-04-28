import { AlertTriangle } from 'lucide-react';
import { notFound } from 'next/navigation';

import { BookingPageFlow } from '@/components/booking/BookingPageFlow';
import { ContextNote } from '@/components/site/context-note';
import { getBookingPageData } from '@/lib/booking/page-data';
import { createPageMetadata } from '@/lib/site';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export const metadata = createPageMetadata({
  title: 'Запись',
  description: 'Онлайн-запись в салон МАРИ.',
  path: '/booking',
});

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const booking = await getBookingPageData(searchParams);
  const extra = booking.catalog.bootstrap.config.extra;
  if (!isSiteBlockVisible(extra, SITE_BLOCK_KEYS.page('booking'))) {
    notFound();
  }
  const showConnectivityNotice = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.bookingPage.connectivityNotice);
  const showPanel = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.bookingPage.panel);
  const showSchedule = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.bookingPage.schedule);
  const showConfirmation = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.bookingPage.confirmation);

  return (
    <main className="pb-0 md:pb-14">
      <div className="w-full md:mx-auto md:mt-8 md:max-w-6xl md:px-6 lg:px-8">
        {showConnectivityNotice &&
        (!booking.catalog.connectivity.bootstrap || !booking.catalog.connectivity.services) ? (
          <div className="mx-4 mb-6 rounded-[1.75rem] border border-[#d7b78d] bg-[#fff3e5] px-5 py-4 text-sm leading-7 text-[#6f5233] md:mx-auto md:max-w-5xl">
            <p className="inline-flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              {booking.bookingContent.connectivityNotice.title}
            </p>
            <p className="mt-2">{booking.bookingContent.connectivityNotice.description}</p>
          </div>
        ) : null}

        <div className="mx-4 md:mx-auto md:max-w-5xl">
          <ContextNote
            service={booking.context.service?.displayName}
            master={booking.context.master?.name}
            offer={booking.context.offer?.title}
            phone={booking.catalog.salon.phone}
          />
        </div>

        <div className="md:mx-auto md:max-w-5xl xl:max-w-6xl">
          <BookingPageFlow
            services={booking.catalog.services}
            specialists={booking.catalog.specialists}
            maintenanceMode={booking.catalog.bootstrap.config.maintenanceMode}
            maintenanceMessage={booking.catalog.bootstrap.config.maintenanceMessage}
            consentLabel={booking.privacyPolicy.bookingConsentLabel}
            initialSelection={booking.initialSelection}
            visibility={{
              panel: showPanel,
              schedule: showSchedule,
              confirmation: showConfirmation,
            }}
          />
        </div>
      </div>
    </main>
  );
}
