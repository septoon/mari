import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';

import { MasterCard } from '@/components/cards/master-card';
import { ServiceCard } from '@/components/cards/service-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { EditorialVisual } from '@/components/site/editorial-visual';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ButtonLink } from '@/components/ui/button';
import { fetchPopularServices } from '@/lib/api/backend';
import {
  buildBeautySalonJsonLd,
  HOME_PAGE_H1,
  HOME_PAGE_HERO_DESCRIPTION,
  HOME_PAGE_PRICE_NOTES,
  HOME_PAGE_SEO_PARAGRAPHS,
} from '@/lib/home-seo';
import { formatCurrency } from '@/lib/format';
import { getHomePageContent } from '@/lib/home-page-content';
import { createPageMetadata, siteSeoConfig } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';

export const metadata = createPageMetadata({
  title: siteSeoConfig.home.title,
  description: siteSeoConfig.home.description,
  path: '/',
  keywords: [...siteSeoConfig.home.keywords],
});

export default async function HomePage() {
  const [catalog, homePageContent] = await Promise.all([getLiveCatalog(), getHomePageContent()]);
  const extra = catalog.bootstrap.config.extra;
  const categoriesServicesLimit = homePageContent.categories.itemsLimit;
  const popularServices = await fetchPopularServices(categoriesServicesLimit).catch(() => []);
  const popularHomeServices =
    popularServices
      .map((service) => catalog.servicesById.get(service.id) ?? null)
      .filter((service): service is NonNullable<typeof service> => service !== null)
      .slice(0, categoriesServicesLimit);
  const masters = catalog.specialists.slice(0, 4);
  const fallbackPopularHomeServices = catalog.services.slice(0, categoriesServicesLimit);
  const featuredServices = catalog.services.slice(0, 4);
  const priceHighlightServices = (
    popularHomeServices.length > 0 ? popularHomeServices : fallbackPopularHomeServices
  ).slice(0, 4);
  const beautySalonJsonLd = buildBeautySalonJsonLd({
    phone: catalog.salon.phone,
    mapUrl: catalog.salon.mapUrl,
  });
  const showHero = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.homePage.hero);
  const showCategories = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.homePage.categories);
  const showValuePillars = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.homePage.valuePillars);
  const showFeaturedServices = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.homePage.featuredServices);
  const showFeaturedSpecialists = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.homePage.featuredSpecialists);
  const showContacts = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.homePage.contacts);
  const showHighlights = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.homePage.highlights);
  const showBottomCta = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.homePage.bottomCta);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(beautySalonJsonLd) }}
      />
      <main className="pb-14">
        {showHero ? (
          <Container className="pb-12 pt-8 md:pb-16 md:pt-12">
            <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <div className="rounded-[2rem] border border-(--line) bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,241,234,0.88)_52%,rgba(232,224,215,0.8)_100%)] px-6 py-8 shadow-[0_35px_110px_rgba(41,30,18,0.08)] md:px-8 md:py-10">
                <p className="section-kicker">{homePageContent.hero.eyebrow}</p>
                <h1 className="headline-xl max-w-4xl whitespace-pre-line">{HOME_PAGE_H1}</h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-(--muted)">
                  {HOME_PAGE_HERO_DESCRIPTION}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href="/booking">
                    {homePageContent.hero.primaryCtaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </ButtonLink>
                  <ButtonLink href="/services" variant="secondary">
                    {homePageContent.hero.secondaryCtaLabel}
                  </ButtonLink>
                </div>
              </div>

              <EditorialVisual
                label={homePageContent.hero.visualLabel}
                title={homePageContent.hero.visualTitle}
                subtitle={homePageContent.hero.visualSubtitle}
                imageUrl={homePageContent.hero.visualImageUrl}
                imageAlt="Интерьер салона красоты МАРИ в Симферополе"
              />
            </section>
          </Container>
        ) : null}

        {showCategories ? (
          <section id="services" className="py-10 md:py-14">
            <Container>
              <SectionHeading
                eyebrow={homePageContent.categories.eyebrow}
                title={homePageContent.categories.title}
                description={homePageContent.categories.description}
                action={
                  <ButtonLink href="/services" variant="secondary">
                    {homePageContent.categories.actionLabel}
                  </ButtonLink>
                }
              />
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {(popularHomeServices.length > 0
                  ? popularHomeServices
                  : fallbackPopularHomeServices
                ).map((service) => (
                  <ServiceCard
                    key={service.id}
                    href={`/services/${service.categorySlug}/${service.slug}`}
                    categoryName={service.category.name}
                    name={service.displayName}
                    excerpt={service.teaser}
                    durationMinutes={Math.round(service.durationSec / 60)}
                    priceFrom={service.priceMin}
                    imageUrl={service.imageUrl || service.category.imageUrl || null}
                  />
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {priceHighlightServices.length ? (
          <section id="prices" className="py-10 md:py-14">
            <Container>
              <SectionHeading
                eyebrow="Цены"
                title="Популярные услуги и ориентиры по стоимости."
                description="Цены на востребованные процедуры."
                action={
                  <ButtonLink href="/prices" variant="secondary">
                    Смотреть все цены
                  </ButtonLink>
                }
              />
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {priceHighlightServices.map((service) => (
                  <article key={service.id} className="surface-card p-6">
                    <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">
                      {service.category.name}
                    </p>
                    <h3 className="mt-4 font-serif text-3xl text-(--ink)">{service.displayName}</h3>
                    <p className="mt-3 text-sm leading-7 text-(--muted)">{service.teaser}</p>
                    <div className="mt-6 flex flex-wrap gap-3 text-sm text-(--muted-strong)">
                      <span className="rounded-full border border-(--line) px-3 py-1.5">
                        от {formatCurrency(service.priceMin)}
                      </span>
                      <span className="rounded-full border border-(--line) px-3 py-1.5">
                        {Math.round(service.durationSec / 60)} мин
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                {HOME_PAGE_PRICE_NOTES.map((item) => (
                  <article key={item.title} className="surface-card p-6">
                    <h3 className="font-serif text-3xl text-(--ink)">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-(--muted)">{item.description}</p>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {showValuePillars ? (
          <section className="py-10 md:py-14">
            <Container>
              <SectionHeading
                eyebrow={homePageContent.valuePillars.eyebrow}
                title={homePageContent.valuePillars.title}
                description={homePageContent.valuePillars.description}
              />
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {homePageContent.valuePillars.items.map((item) => (
                  <article key={item.title} className="surface-card p-6">
                    <h3 className="font-serif text-3xl text-(--ink)">{item.title}</h3>
                    <p className="mt-4 text-sm leading-7 text-(--muted)">{item.text}</p>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {showFeaturedServices ? (
          <section className="py-10 md:py-14">
            <Container>
              <SectionHeading
                eyebrow={homePageContent.featuredServices.eyebrow}
                title={homePageContent.featuredServices.title}
                description={homePageContent.featuredServices.description}
                action={
                  <ButtonLink href="/prices" variant="secondary">
                    {homePageContent.featuredServices.actionLabel}
                  </ButtonLink>
                }
              />
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredServices.map((service) => (
                  <ServiceCard
                    key={service.id}
                    href={`/services/${service.categorySlug}/${service.slug}`}
                    categoryName={service.category.name}
                    name={service.displayName}
                    excerpt={service.teaser}
                    durationMinutes={Math.round(service.durationSec / 60)}
                    priceFrom={service.priceMin}
                    imageUrl={service.imageUrl || service.category.imageUrl || null}
                  />
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        <section id="about" className="py-10 md:py-14">
          <Container>
            <SectionHeading
              eyebrow="О салоне"
              title="Салон красоты в Симферополе для ухода, стиля и регулярных визитов."
              description="Маникюр, стрижки, окрашивание, косметология, ресницы, брови и онлайн-запись в центре города."
            />
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <article className="surface-card p-6 md:p-8">
                <div className="space-y-4 text-sm leading-7 text-(--muted)">
                  {HOME_PAGE_SEO_PARAGRAPHS.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>

              <aside className="space-y-6">
                <article className="surface-card p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">
                    Адрес
                  </p>
                  <h3 className="mt-4 font-serif text-3xl text-(--ink)">{catalog.salon.address}</h3>
                  <p className="mt-4 text-sm leading-7 text-(--muted)">
                    Подходит тем, кто ищет салон красоты рядом и хочет качественно совместить уход, стрижку, окрашивание, ресницы или брови за один визит.
                  </p>
                </article>

                <article className="surface-card p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">
                    Онлайн-запись
                  </p>
                  <h3 className="mt-4 font-serif text-3xl text-(--ink)">
                    Выбор услуги, мастера и времени без звонков.
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-(--muted)">
                    На сайте удобно сравнить процедуры, посмотреть цены и сразу записаться в салон красоты на удобный день.
                  </p>
                </article>

                <article className="surface-card p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">
                    Контакты
                  </p>
                  <h3 className="mt-4 font-serif text-3xl text-(--ink)">{catalog.salon.phone}</h3>
                  <p className="mt-4 text-sm leading-7 text-(--muted)">
                    Если удобнее уточнить детали перед визитом, можно быстро перейти на страницу контактов или открыть карту.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <ButtonLink href="/contacts" variant="secondary">
                      Контакты салона
                    </ButtonLink>
                    <ButtonLink href="/booking">Онлайн-запись</ButtonLink>
                  </div>
                </article>
              </aside>
            </div>
          </Container>
        </section>

        {showFeaturedSpecialists ? (
          <section className="py-10 md:py-14">
            <Container>
              <SectionHeading
                eyebrow={homePageContent.featuredSpecialists.eyebrow}
                title={homePageContent.featuredSpecialists.title}
                description={homePageContent.featuredSpecialists.description}
                action={
                  <ButtonLink href="/masters" variant="secondary">
                    {homePageContent.featuredSpecialists.actionLabel}
                  </ButtonLink>
                }
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
                    imageUrl={master.photo?.preferredUrl ?? null}
                  />
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {showContacts || showHighlights ? (
          <section id="contacts" className="py-10 md:py-14">
            <Container>
              <div
                className={`grid gap-6 ${showContacts && showHighlights ? 'lg:grid-cols-[0.95fr_1.05fr]' : ''}`}
              >
                {showContacts ? (
                  <div className="surface-card p-8">
                    <p className="section-kicker">{homePageContent.contacts.eyebrow}</p>
                    <h2 className="section-title">{homePageContent.contacts.title}</h2>
                    <p className="section-copy">{homePageContent.contacts.description}</p>
                    <div className="mt-8 grid gap-3 text-sm text-(--muted)">
                      <div className="surface-card p-4">{catalog.salon.address}</div>
                      <div className="surface-card p-4">{catalog.salon.phone}</div>
                      <div className="surface-card p-4">{catalog.salon.workingHours}</div>
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                      <ButtonLink href="/booking">{homePageContent.contacts.primaryCtaLabel}</ButtonLink>
                      <ButtonLink href="/contacts" variant="secondary">
                        {homePageContent.contacts.secondaryCtaLabel}
                      </ButtonLink>
                    </div>
                  </div>
                ) : null}

                {showHighlights ? (
                  <div className="space-y-6">
                    {homePageContent.highlights.map((item, index) => {
                      const Icon = index === 0 ? CalendarDays : index === 1 ? ShieldCheck : Sparkles;

                      return (
                        <div key={item.title} className="surface-card p-6">
                          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-(--muted-strong)">
                            <Icon className="h-4 w-4" />
                            {item.title}
                          </p>
                          <p className="mt-4 text-sm leading-7 text-(--muted)">{item.description}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </Container>
          </section>
        ) : null}

        {showBottomCta ? (
          <div id="booking">
            <CtaPanel
              eyebrow={homePageContent.bottomCta.eyebrow}
              title={homePageContent.bottomCta.title}
              description={homePageContent.bottomCta.description}
              actions={
                <>
                  <ButtonLink href="/booking">{homePageContent.bottomCta.primaryCtaLabel}</ButtonLink>
                  <ButtonLink href="/masters" variant="secondary">
                    {homePageContent.bottomCta.secondaryCtaLabel}
                  </ButtonLink>
                </>
              }
            />
          </div>
        ) : null}
      </main>
    </>
  );
}
