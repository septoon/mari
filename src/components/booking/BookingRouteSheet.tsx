'use client';

import { useRouter } from 'next/navigation';

import { BookingSheet } from '@/components/booking/BookingSheet';
import type { BookingPageClientProps } from '@/lib/booking/types';

export function BookingRouteSheet(props: BookingPageClientProps) {
  const router = useRouter();

  return (
    <BookingSheet
      {...props}
      open
      onClose={() => {
        router.back();
      }}
    />
  );
}
