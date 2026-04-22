import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';

import { ArticleCard } from '@/components/cards/article-card';
import { MasterCard } from '@/components/cards/master-card';
import { OfferCard } from '@/components/cards/offer-card';
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
import { getSiteNews, getSiteOffers } from '@/lib/site-content';
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
  const [catalog, homePageContent, news, offers] = await Promise.all([
    getLiveCatalog(),
    getHomePageContent(),
    getSiteNews(),
    getSiteOffers(),
  ]);
  const extra = catalog.bootstrap.config.extra;
  const siteContent =
    extra && typeof extra === 'object' && !Array.isArray(extra) && extra.siteContent && typeof extra.siteContent === 'object' && !Array.isArray(extra.siteContent)
      ? (extra.siteContent as Record<string, unknown>)
      : {};
  const configuredOffers = Array.isArray(siteContent.offers) ? siteContent.offers : [];
  const homeOffers = configuredOffers.length > 0 ? offers : [];
  const homeNews = news.slice(0, homePageContent.news.itemsLimit);
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
  const showNews = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.homePage.news);
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

        {showNews && homeNews.length > 0 ? (
          <section className="py-10 md:py-14">
            <Container>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <SectionHeading
                  eyebrow={homePageContent.news.eyebrow}
                  title={homePageContent.news.title}
                  description={homePageContent.news.description}
                />
                <ButtonLink href="/news" variant="secondary">
                  {homePageContent.news.actionLabel}
                </ButtonLink>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {homeNews.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </Container>
          </section>
        ) : null}

        {homeOffers.length > 0 ? (
          <section className="py-10 md:py-14">
            <Container>
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <SectionHeading
                  eyebrow="Акции"
                  title="Специальные предложения MARI."
                  description="Блок показывается только для акций, которые заведены в mari-staff и сейчас доступны на сайте."
                />
                <ButtonLink href="/booking" variant="secondary">
                  Перейти к записи
                </ButtonLink>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {homeOffers.map((offer) => (
                  <OfferCard key={offer.slug} offer={offer} />
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
