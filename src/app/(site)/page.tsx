import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';

import { CategoryCard } from '@/components/cards/category-card';
import { MasterCard } from '@/components/cards/master-card';
import { ServiceCard } from '@/components/cards/service-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { EditorialVisual } from '@/components/site/editorial-visual';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ButtonLink } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';

export const metadata = createPageMetadata({
  title: 'Главная',
  description:
    'MARI Beauty Salon: услуги, мастера, цены и онлайн-запись в салон красоты.'
});

const valuePillars = [
  {
    title: 'Понятный выбор',
    text: 'На сайте легко сравнить услуги, посмотреть длительность и сразу перейти к записи.'
  },
  {
    title: 'Сильные мастера',
    text: 'У каждого специалиста есть профиль с направлениями работы и удобным переходом к записи.'
  },
  {
    title: 'Честные цены',
    text: 'В карточках сразу видно ориентир по стоимости и длительности, без сложных условий.'
  },
  {
    title: 'Комфорт после записи',
    text: 'В личном кабинете можно посмотреть визиты, обновить профиль и управлять ближайшими записями.'
  }
];

export default async function HomePage() {
  const catalog = await getLiveCatalog();
  const featuredCategories = catalog.serviceCategories.slice(0, 6);
  const featuredServices = catalog.services.slice(0, 4);
  const masters = catalog.specialists.slice(0, 4);

  return (
    <main className="pb-14">
      <Container className="pb-12 pt-8 md:pb-16 md:pt-12">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="rounded-[2rem] border border-[color:var(--line)] bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,241,234,0.88)_52%,rgba(232,224,215,0.8)_100%)] px-6 py-8 shadow-[0_35px_110px_rgba(41,30,18,0.08)] md:px-8 md:py-10">
            <p className="section-kicker">Салон красоты MARI</p>
            <h1 className="headline-xl max-w-4xl">
              Услуги, мастера
              <br />
              и запись
              <br />
              в одном спокойном ритме.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[color:var(--muted)]">
              Здесь можно выбрать услугу, познакомиться с мастерами, посмотреть цены и сразу подобрать удобное время для визита.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contacts#booking">
                Записаться
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                Выбрать услугу
              </ButtonLink>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="surface-card p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Категории</p>
                <p className="mt-3 font-serif text-4xl text-[color:var(--ink)]">{catalog.serviceCategories.length}</p>
              </div>
              <div className="surface-card p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Услуги</p>
                <p className="mt-3 font-serif text-4xl text-[color:var(--ink)]">{catalog.services.length}</p>
              </div>
              <div className="surface-card p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Мастера</p>
                <p className="mt-3 font-serif text-4xl text-[color:var(--ink)]">{catalog.specialists.length}</p>
              </div>
            </div>
          </div>

          <EditorialVisual
            label="MARI"
            title="Спокойное пространство для ухода, цвета и точной работы с образом."
            subtitle="Сайт собран так, чтобы путь от первого знакомства до записи был коротким, понятным и приятным."
          />
        </section>
      </Container>

      <section className="py-10 md:py-14">
        <Container>
          <SectionHeading
            eyebrow="Популярные направления"
            title="Выберите направление, с которого хотите начать."
            description="Волосы, ногтевой сервис, уход за лицом, брови, ресницы и другие процедуры собраны в удобный каталог."
            action={<ButtonLink href="/services" variant="secondary">Все услуги</ButtonLink>}
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                serviceCount={category.services.length}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <SectionHeading
            eyebrow="Почему выбирают нас"
            title="В MARI важны комфорт, точность и уважение к вашему времени."
            description="Мы убрали всё лишнее и оставили только то, что помогает быстро принять решение и записаться без лишних шагов."
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {valuePillars.map((item) => (
              <article key={item.title} className="surface-card p-6">
                <h3 className="font-serif text-3xl text-[color:var(--ink)]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{item.text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <SectionHeading
            eyebrow="Услуги"
            title="Популярные процедуры, которые выбирают чаще всего."
            description="У каждой услуги есть краткое описание, длительность, ориентир по стоимости и переход к записи."
            action={<ButtonLink href="/prices" variant="secondary">Смотреть цены</ButtonLink>}
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {featuredServices.map((service) => (
              <ServiceCard
                key={service.id}
                href={`/services/${service.categorySlug}/${service.slug}`}
                categoryName={service.category.name}
                name={service.displayName}
                excerpt={service.teaser}
                durationMinutes={Math.round(service.durationSec / 60)}
                priceFrom={service.priceMin}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <SectionHeading
            eyebrow="Мастера"
            title="Мастера, которым доверяют постоянные гости."
            description="Познакомьтесь со специалистами, их направлениями и выберите того, кто подходит именно вам."
            action={<ButtonLink href="/masters" variant="secondary">Все мастера</ButtonLink>}
          />
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {masters.map((master) => (
              <MasterCard
                key={master.staffId}
                href={`/masters/${master.slug}`}
                name={master.name}
                specialty={master.specialtyLabel}
                summary={master.summary}
                servicesCount={master.services.length}
                categories={master.categoryNames}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-card p-8">
              <p className="section-kicker">Салон MARI</p>
              <h2 className="section-title">Контакты, запись и поддержка собраны в одном месте.</h2>
              <p className="section-copy">
                Можно позвонить, посмотреть адрес, выбрать услугу и сразу перейти к записи без долгих переходов по сайту.
              </p>
              <div className="mt-8 grid gap-3 text-sm text-[color:var(--muted)]">
                <div className="surface-card p-4">{catalog.salon.address}</div>
                <div className="surface-card p-4">{catalog.salon.phone}</div>
                <div className="surface-card p-4">{catalog.salon.workingHours}</div>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/contacts#booking">Записаться</ButtonLink>
                <ButtonLink href="/contacts" variant="secondary">
                  Контакты салона
                </ButtonLink>
              </div>
            </div>

            <div className="space-y-6">
              <div className="surface-card p-6">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">
                  <CalendarDays className="h-4 w-4" />
                  Онлайн-запись
                </p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                  Выберите услуги, мастера и удобное время в одном аккуратном сценарии записи.
                </p>
              </div>
              <div className="surface-card p-6">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">
                  <ShieldCheck className="h-4 w-4" />
                  Личный кабинет
                </p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                  После входа можно посмотреть историю визитов, обновить профиль и управлять записями.
                </p>
              </div>
              <div className="surface-card p-6">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">
                  <Sparkles className="h-4 w-4" />
                  Спокойная атмосфера
                </p>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
                  Тёплый визуальный язык сайта передаёт настроение салона и помогает сосредоточиться на выборе.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <CtaPanel
        eyebrow="Запись"
        title="Выберите услугу, мастера и удобное время для визита."
        description="Основные разделы сайта собраны так, чтобы от знакомства с салоном вы могли сразу перейти к записи."
        actions={
          <>
            <ButtonLink href="/contacts#booking">Записаться</ButtonLink>
            <ButtonLink href="/masters" variant="secondary">
              Выбрать мастера
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
