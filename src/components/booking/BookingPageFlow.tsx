'use client';

import { BookingFlow } from '@/components/booking/BookingFlow';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import type { BookingPageClientProps } from '@/lib/booking/types';

export function BookingPageFlow({
  services,
  specialists,
  maintenanceMode,
  maintenanceMessage,
  consentLabel,
  initialSelection,
  visibility
}: BookingPageClientProps) {
  const flow = useBookingFlow({
    services,
    specialists,
    initialSelection,
    restoreStoredService: false,
    startStep: 'overview'
  });

  return (
    <section
      id="booking"
      className="h-[calc(100svh-var(--site-header-offset,0px))] min-h-[42rem] overflow-hidden bg-(--background) md:h-[calc(100svh-11rem)] md:min-h-[46rem] md:rounded-[2rem] md:border md:border-(--line) md:shadow-[0_30px_90px_rgba(12,77,85,0.1)]"
    >
      <BookingFlow
        flow={flow}
        services={services}
        consentLabel={consentLabel}
        maintenanceMode={maintenanceMode}
        maintenanceMessage={maintenanceMessage}
        variant="page"
        visibility={visibility}
      />
    </section>
  );
}
