import { BookingRouteSheet } from '@/components/booking/BookingRouteSheet';
import { getBookingPageData } from '@/lib/booking/page-data';

type SearchValue = string | string[] | undefined;

export default async function BookingModalPage({
  searchParams
}: {
  searchParams: Promise<Record<string, SearchValue>>;
}) {
  const booking = await getBookingPageData(searchParams);

  return (
    <BookingRouteSheet
      services={booking.catalog.services}
      specialists={booking.catalog.specialists}
      maintenanceMode={booking.catalog.bootstrap.config.maintenanceMode}
      maintenanceMessage={booking.catalog.bootstrap.config.maintenanceMessage}
      consentLabel={booking.privacyPolicy.bookingConsentLabel}
      initialSelection={booking.initialSelection}
    />
  );
}
