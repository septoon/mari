import { ArrowRight, CalendarDays, ShieldCheck, Sparkles } from 'lucide-react';

import { CategoryCard } from '@/components/cards/category-card';
import { MasterCard } from '@/components/cards/master-card';
import { ServiceCard } from '@/components/cards/service-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { EditorialVisual } from '@/components/site/editorial-visual';
import { Container } from '@/components/ui/container';
import { SectionHeading } from '@/components/ui/section-heading';
import { ButtonLink } from '@/components/ui/button';
import { getHomePageContent } from '@/lib/home-page-content';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';

export const metadata = createPageMetadata({
  title: 'Главная',
  description:
    'MARI Beauty Salon: услуги, специалисты, цены и онлайн-запись в салон красоты.'
});

export default async function HomePage() {
  const [catalog, homePageContent] = await Promise.all([getLiveCatalog(), getHomePageContent()]);
  const featuredCategories = catalog.serviceCategories.slice(0, 6);
  const featuredServices = catalog.services.slice(0, 4);
  const masters = catalog.specialists.slice(0, 4);

  return (
    <main className="pb-14">
      <Container className="pb-12 pt-8 md:pb-16 md:pt-12">
        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <div className="rounded-[2rem] border border-(--line) bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(247,241,234,0.88)_52%,rgba(232,224,215,0.8)_100%)] px-6 py-8 shadow-[0_35px_110px_rgba(41,30,18,0.08)] md:px-8 md:py-10">
            <p className="section-kicker">{homePageContent.hero.eyebrow}</p>
            <h1 className="headline-xl max-w-4xl whitespace-pre-line">
              {homePageContent.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-(--muted)">
              {homePageContent.hero.description}
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
          />
        </section>
      </Container>

      <section className="py-10 md:py-14">
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
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-card p-8">
              <p className="section-kicker">{homePageContent.contacts.eyebrow}</p>
              <h2 className="section-title">{homePageContent.contacts.title}</h2>
              <p className="section-copy">
                {homePageContent.contacts.description}
              </p>
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

            <div className="space-y-6">
              {homePageContent.highlights.map((item, index) => {
                const Icon =
                  index === 0 ? CalendarDays : index === 1 ? ShieldCheck : Sparkles;

                return (
                  <div key={item.title} className="surface-card p-6">
                    <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-(--muted-strong)">
                      <Icon className="h-4 w-4" />
                      {item.title}
                    </p>
                    <p className="mt-4 text-sm leading-7 text-(--muted)">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

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
    </main>
  );
}
