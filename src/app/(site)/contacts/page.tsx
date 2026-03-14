import { AlertTriangle, MapPin, PhoneCall } from 'lucide-react';

import { BookingPanel } from '@/components/booking-panel';
import { ContextNote } from '@/components/site/context-note';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { SectionHeading } from '@/components/ui/section-heading';
import { getOffers } from '@/content/queries';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';

export const metadata = createPageMetadata({
  title: 'Контакты',
  description: 'Контакты салона MARI и онлайн-запись.',
  path: '/contacts'
});

type SearchValue = string | string[] | undefined;

const firstValue = (value: SearchValue) => (Array.isArray(value) ? value[0] : value);

export default async function ContactsPage({
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
          eyebrow="Контакты и запись"
          title="Контакты и запись в MARI."
          description="Позвоните, постройте маршрут или выберите удобное время для визита прямо на этой странице."
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Контакты' }]}
          actions={
            <>
              <ButtonLink href={catalog.salon.phoneHref}>
                <PhoneCall className="h-4 w-4" />
                Позвонить
              </ButtonLink>
              <ButtonLink href="/account" variant="secondary">
                Личный кабинет
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                Смотреть услуги
              </ButtonLink>
            </>
          }
          details={[
            'Здесь можно быстро перейти к записи, если вы уже выбрали услугу или мастера.',
            'Если удобнее, позвоните нам и мы поможем подобрать визит.'
          ]}
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

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-card p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Салон MARI</p>
            <h2 className="mt-4 font-serif text-4xl text-[color:var(--ink)]">{catalog.salon.name}</h2>
            <div className="mt-6 grid gap-4 text-sm leading-7 text-[color:var(--muted)]">
              <p className="inline-flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-[color:var(--accent-strong)]" />
                <span>{catalog.salon.address}</span>
              </p>
              <p>{catalog.salon.phone}</p>
              <p>{catalog.salon.workingHours}</p>
              <p>{catalog.salon.email}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={catalog.salon.phoneHref}>Позвонить</ButtonLink>
              {catalog.salon.mapUrl ? (
                <ButtonLink href={catalog.salon.mapUrl} variant="secondary">
                  Открыть карту
                </ButtonLink>
              ) : null}
            </div>
          </article>

          <article className="surface-card p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Что можно сделать здесь</p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4 text-sm leading-7 text-[color:var(--muted)]">
                Выбрать услугу, мастера и удобное время для визита.
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4 text-sm leading-7 text-[color:var(--muted)]">
                Войти в личный кабинет и посмотреть свои записи.
              </div>
              <div className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4 text-sm leading-7 text-[color:var(--muted)]">
                Открыть каталог услуг и быстро перейти к нужной процедуре.
              </div>
            </div>
          </article>
        </section>

        <section id="booking" className="mt-16 scroll-mt-28">
          <SectionHeading
            eyebrow="Онлайн-запись"
            title="Выберите услуги, мастера и удобное время."
            description="Запись собрана так, чтобы вы могли быстро оформить визит без звонка и лишних шагов."
          />
          <div className="mt-8">
            <BookingPanel
              services={catalog.services}
              specialists={catalog.specialists}
              maintenanceMode={catalog.bootstrap.config.maintenanceMode}
              maintenanceMessage={catalog.bootstrap.config.maintenanceMessage}
            />
          </div>
        </section>


      </Container>
    </main>
  );
}
