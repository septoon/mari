import { AlertTriangle, PhoneCall } from 'lucide-react';

import { BookingPageFlow } from '@/components/booking/BookingPageFlow';
import { ContextNote } from '@/components/site/context-note';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getBookingPageData } from '@/lib/booking/page-data';
import { createPageMetadata } from '@/lib/site';
import { resolveSitePageHero } from '@/lib/site-page-heroes';

export const metadata = createPageMetadata({
  title: 'Запись',
  description: 'Онлайн-запись в салон MARI.',
  path: '/booking'
});

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const booking = await getBookingPageData(searchParams);
  const hero = resolveSitePageHero('booking', booking.catalog.bootstrap.config.extra);

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Запись' }]}
          actions={
            <>
              <ButtonLink href={booking.catalog.salon.phoneHref}>
                <PhoneCall className="h-4 w-4" />
                {booking.bookingContent.heroActions.phoneLabel}
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                {booking.bookingContent.heroActions.servicesLabel}
              </ButtonLink>
              <ButtonLink href="/contacts" variant="secondary">
                {booking.bookingContent.heroActions.contactsLabel}
              </ButtonLink>
            </>
          }
        />

        {!booking.catalog.connectivity.bootstrap || !booking.catalog.connectivity.services ? (
          <div className="mb-8 rounded-[1.75rem] border border-[#d7b78d] bg-[#fff3e5] px-5 py-4 text-sm leading-7 text-[#6f5233]">
            <p className="inline-flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              {booking.bookingContent.connectivityNotice.title}
            </p>
            <p className="mt-2">{booking.bookingContent.connectivityNotice.description}</p>
          </div>
        ) : null}

        <ContextNote
          service={booking.context.service?.displayName}
          master={booking.context.master?.name}
          offer={booking.context.offer?.title}
          phone={booking.catalog.salon.phone}
        />

        <div className="mt-12">
          <BookingPageFlow
            services={booking.catalog.services}
            specialists={booking.catalog.specialists}
            maintenanceMode={booking.catalog.bootstrap.config.maintenanceMode}
            maintenanceMessage={booking.catalog.bootstrap.config.maintenanceMessage}
            consentLabel={booking.privacyPolicy.bookingConsentLabel}
            initialSelection={booking.initialSelection}
          />
        </div>
      </Container>
    </main>
  );
}
