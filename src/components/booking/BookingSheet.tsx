'use client';

import { useEffect, useRef } from 'react';
import { Sheet, type SheetRef } from 'react-modal-sheet';

import { BookingFlow } from '@/components/booking/BookingFlow';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import type { BookingPageClientProps } from '@/lib/booking/types';

type BookingSheetProps = BookingPageClientProps & {
  open: boolean;
  onClose: () => void;
};

export function BookingSheet({
  open,
  onClose,
  services,
  specialists,
  maintenanceMode,
  maintenanceMessage,
  consentLabel,
  initialSelection
}: BookingSheetProps) {
  const ref = useRef<SheetRef>(null);
  const flow = useBookingFlow({
    services,
    specialists,
    initialSelection
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      if (flow.requestClose()) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flow, onClose, open]);

  return (
    <Sheet
      ref={ref}
      isOpen={open}
      onClose={() => {
        if (flow.requestClose()) {
          onClose();
        }
      }}
      snapPoints={[0, 0.72, 1]}
      initialSnap={2}
      disableDismiss={flow.state.loading.submit}
      disableScrollLocking
      tweenConfig={{ ease: 'easeOut', duration: 0.24 }}
    >
      <Sheet.Container className="!mx-auto !w-full !max-w-[52rem] !rounded-t-[2rem] !bg-transparent md:!mb-6 md:!rounded-[2rem]">
        <Sheet.Header />
        <Sheet.Content>
          <BookingFlow
            flow={flow}
            services={services}
            consentLabel={consentLabel}
            maintenanceMode={maintenanceMode}
            maintenanceMessage={maintenanceMessage}
            variant="sheet"
            onClose={() => {
              if (flow.requestClose()) {
                onClose();
              }
            }}
            onDone={() => {
              flow.reset();
              onClose();
            }}
          />
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop
        onClick={() => {
          if (flow.requestClose()) {
            onClose();
          }
        }}
        className="!bg-[rgba(13,34,37,0.42)] !backdrop-blur-sm"
      />
    </Sheet>
  );
}
