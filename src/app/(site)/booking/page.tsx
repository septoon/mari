import { AlertTriangle, PhoneCall } from 'lucide-react';

import { BookingPanel } from '@/components/booking-panel';
import { ContextNote } from '@/components/site/context-note';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getOffers } from '@/content/queries';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';

export const metadata = createPageMetadata({
  title: 'Запись',
  description: 'Онлайн-запись в салон MARI.',
  path: '/booking'
});

type SearchValue = string | string[] | undefined;

const firstValue = (value: SearchValue) => (Array.isArray(value) ? value[0] : value);

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchValue>>;
}) {
  const params = await searchParams;
  const serviceSlug = firstValue(params.service);
  const masterSlug = firstValue(params.master);
  const offerSlug = firstValue(params.offer);

  const catalog = await getLiveCatalog();
  const service = serviceSlug ? catalog.services.find((item) => item.slug === serviceSlug) ?? null : null;
  const master = masterSlug ? catalog.specialists.find((item) => item.slug === masterSlug) ?? null : null;
  const offer = offerSlug ? getOffers().find((item) => item.slug === offerSlug) ?? null : null;

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow="Запись"
          title="Онлайн-запись в MARI."
          description="Выберите услугу, специалиста и удобное время для визита на отдельной странице записи."
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Запись' }]}
          actions={
            <>
              <ButtonLink href={catalog.salon.phoneHref}>
                <PhoneCall className="h-4 w-4" />
                Позвонить
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                Смотреть услуги
              </ButtonLink>
              <ButtonLink href="/contacts" variant="secondary">
                Контакты
              </ButtonLink>
            </>
          }
        />

        {!catalog.connectivity.bootstrap || !catalog.connectivity.services ? (
          <div className="mb-8 rounded-[1.75rem] border border-[#d7b78d] bg-[#fff3e5] px-5 py-4 text-sm leading-7 text-[#6f5233]">
            <p className="inline-flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Часть данных временно обновляется медленнее обычного.
            </p>
            <p className="mt-2">
              Если не нашли нужную услугу или время, позвоните нам и мы поможем подобрать визит.
            </p>
          </div>
        ) : null}

        <ContextNote
          service={service?.displayName}
          master={master?.name}
          offer={offer?.title}
        />

        <div className="mt-12">
          <BookingPanel
            services={catalog.services}
            specialists={catalog.specialists}
            maintenanceMode={catalog.bootstrap.config.maintenanceMode}
            maintenanceMessage={catalog.bootstrap.config.maintenanceMessage}
          />
        </div>
      </Container>
    </main>
  );
}
