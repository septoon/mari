'use client';

import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { Sheet, type SheetRef } from 'react-modal-sheet';

import { BookingFlow } from '@/components/booking/BookingFlow';
import { useBookingFlow } from '@/hooks/useBookingFlow';
import type { BookingPageClientProps } from '@/lib/booking/types';

type BookingSheetProps = BookingPageClientProps & {
  open: boolean;
  onClose: () => void;
};

const BREAKPOINT_QUERY = '(min-width: 1024px)';

const subscribeDesktop = (callback: () => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const mediaQuery = window.matchMedia(BREAKPOINT_QUERY);
  mediaQuery.addEventListener('change', callback);
  return () => mediaQuery.removeEventListener('change', callback);
};

const getDesktopSnapshot = () =>
  typeof window !== 'undefined' && window.matchMedia(BREAKPOINT_QUERY).matches;

const subscribeClient = () => () => {};

export function BookingSheet({
  open,
  onClose,
  services,
  specialists,
  maintenanceMode,
  maintenanceMessage,
  consentLabel
}: BookingSheetProps) {
  const ref = useRef<SheetRef>(null);
  const didInitializeOpenRef = useRef(false);
  const isClient = useSyncExternalStore(subscribeClient, () => true, () => false);
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, () => false);
  const flow = useBookingFlow({
    services,
    specialists,
    restoreStoredService: false,
    startStep: 'overview'
  });

  const handleDismiss = useCallback(() => {
    if (flow.requestClose()) {
      onClose();
    }
  }, [flow, onClose]);

  useEffect(() => {
    if (!open) {
      didInitializeOpenRef.current = false;
      return;
    }

    if (didInitializeOpenRef.current) {
      return;
    }

    didInitializeOpenRef.current = true;
    flow.reset();
  }, [flow, open]);

  useEffect(() => {
    if (!isClient || !open) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyOverflowX = document.body.style.overflowX;
    const previousBodyOverscrollBehaviorX = document.body.style.overscrollBehaviorX;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousHtmlOverflowX = document.documentElement.style.overflowX;
    const previousHtmlOverscrollBehaviorX = document.documentElement.style.overscrollBehaviorX;

    document.body.style.overflow = 'hidden';
    document.body.style.overflowX = 'hidden';
    document.body.style.overscrollBehaviorX = 'none';
    document.documentElement.style.overflow = 'hidden';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.overscrollBehaviorX = 'none';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.overflowX = previousBodyOverflowX;
      document.body.style.overscrollBehaviorX = previousBodyOverscrollBehaviorX;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.documentElement.style.overflowX = previousHtmlOverflowX;
      document.documentElement.style.overscrollBehaviorX = previousHtmlOverscrollBehaviorX;
    };
  }, [isClient, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      handleDismiss();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDismiss, open]);

  const flowContent = (
    <BookingFlow
      flow={flow}
      services={services}
      consentLabel={consentLabel}
      maintenanceMode={maintenanceMode}
      maintenanceMessage={maintenanceMessage}
      variant="sheet"
      onClose={handleDismiss}
      onDone={() => {
        flow.reset();
        onClose();
      }}
    />
  );

  if (isClient && isDesktop) {
    return createPortal(
      <div
        className={`fixed inset-0 z-[110] transition-opacity duration-300 ${
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!open}
      >
        <button
          type="button"
          className="absolute inset-0 bg-[rgba(13,34,37,0.42)] backdrop-blur-sm"
          onClick={handleDismiss}
          aria-label="Закрыть запись"
        />

        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Онлайн-запись"
          className={`absolute inset-y-0 left-0 z-[111] flex w-[min(48rem,calc(100vw-4rem))] max-w-full flex-col overflow-hidden rounded-r-[2rem] border-r border-(--line) bg-(--background) shadow-[24px_0_80px_rgba(19,29,31,0.18)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          {flowContent}
        </aside>
      </div>,
      document.body
    );
  }

  return (
    <Sheet
      ref={ref}
      isOpen={open}
      detent="full"
      onClose={handleDismiss}
      snapPoints={[0, 0.72, 1]}
      initialSnap={2}
      disableDismiss={flow.state.loading.submit}
      disableScrollLocking
      tweenConfig={{ ease: 'easeOut', duration: 0.24 }}
    >
      <Sheet.Container className="!mx-auto !w-full !max-w-208 !overflow-hidden !bg-(--background) !shadow-[0_-24px_80px_rgba(19,29,31,0.16)] md:!mb-6 md:!rounded-[2rem]">
        <Sheet.Header className="!bg-(--background)">
          <div className="flex h-6 items-center justify-center bg-(--background)">
            <span className="h-1 w-11 rounded-full bg-(--line-strong)" />
          </div>
        </Sheet.Header>
        <Sheet.Content
          className="!flex !min-h-0 !flex-1 !bg-(--background)"
          scrollClassName="!flex !min-h-full !flex-col !overflow-hidden !bg-(--background)"
        >
          {flowContent}
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop
        onClick={handleDismiss}
        className="!bg-[rgba(13,34,37,0.42)] !backdrop-blur-sm"
      />
    </Sheet>
  );
}
