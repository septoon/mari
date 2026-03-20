import { MapPin, PhoneCall } from 'lucide-react';
import { redirect } from 'next/navigation';

import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { resolveSitePageHero } from '@/lib/site-page-heroes';

export const metadata = createPageMetadata({
  title: 'Контакты',
  description: 'Контакты салона MARI, адрес, телефон и маршрут.',
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
  const bookingSearchParams = new URLSearchParams();
  const serviceSlug = firstValue(params.service);
  const masterSlug = firstValue(params.master);
  const offerSlug = firstValue(params.offer);

  if (serviceSlug) {
    bookingSearchParams.set('service', serviceSlug);
  }

  if (masterSlug) {
    bookingSearchParams.set('master', masterSlug);
  }

  if (offerSlug) {
    bookingSearchParams.set('offer', offerSlug);
  }

  if (bookingSearchParams.size) {
    redirect(`/booking?${bookingSearchParams.toString()}`);
  }

  const catalog = await getLiveCatalog();
  const hero = resolveSitePageHero('contacts', catalog.bootstrap.config.extra);

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Контакты' }]}
          actions={
            <>
              <ButtonLink href="/booking">Записаться</ButtonLink>
              <ButtonLink href={catalog.salon.phoneHref} variant="secondary">
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
        />

        <section className="mt-12 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="surface-card p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">Салон MARI</p>
            <h2 className="mt-4 font-serif text-4xl text-(--ink)">{catalog.salon.name}</h2>
            <div className="mt-6 grid gap-4 text-sm leading-7 text-(--muted)">
              <p className="inline-flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-(--accent-strong)" />
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
            <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">Что можно сделать здесь</p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.5rem] border border-(--line) bg-white/72 p-4 text-sm leading-7 text-(--muted)">
                Перейти на страницу записи и выбрать услугу, специалиста и удобное время.
              </div>
              <div className="rounded-[1.5rem] border border-(--line) bg-white/72 p-4 text-sm leading-7 text-(--muted)">
                Позвонить в салон, уточнить детали и быстро построить маршрут.
              </div>
              <div className="rounded-[1.5rem] border border-(--line) bg-white/72 p-4 text-sm leading-7 text-(--muted)">
                Войти в личный кабинет и посмотреть свои записи.
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/booking">Перейти к записи</ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                Смотреть услуги
              </ButtonLink>
            </div>
          </article>
        </section>
      </Container>
    </main>
  );
}
