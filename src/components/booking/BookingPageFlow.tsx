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
  initialSelection
}: BookingPageClientProps) {
  const flow = useBookingFlow({
    services,
    specialists,
    initialSelection
  });

  return (
    <section
      id="booking"
      className="overflow-hidden rounded-[2rem] border border-[color:var(--line)] bg-white shadow-[0_30px_90px_rgba(12,77,85,0.1)]"
    >
      <BookingFlow
        flow={flow}
        services={services}
        consentLabel={consentLabel}
        maintenanceMode={maintenanceMode}
        maintenanceMessage={maintenanceMessage}
        variant="page"
      />
    </section>
  );
}
