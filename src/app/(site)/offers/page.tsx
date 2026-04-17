import { OfferCard } from '@/components/cards/offer-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getClientBootstrap } from '@/lib/api/backend';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { isSiteBlockVisible, SITE_BLOCK_KEYS } from '@/lib/site-visibility';
import { getSiteOffers } from '@/lib/site-content';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Акции',
  description: 'Акции и специальные предложения МАРИ.',
  path: '/offers',
});

export default async function OffersPage() {
  const [offers, bootstrap] = await Promise.all([getSiteOffers(), getClientBootstrap()]);
  const hero = resolveSitePageHero('offers', bootstrap.config.extra);
  const extra = bootstrap.config.extra;
  const showHero = isSiteBlockVisible(extra, SITE_BLOCK_KEYS.pageHero('offers'));

  return (
    <main className="pb-14">
      <Container>
        {showHero ? (
          <PageHero
            eyebrow={hero.eyebrow}
            title={hero.title}
            description={hero.description}
            imageUrl={hero.imageUrl}
            imageAlt={hero.title}
            breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Акции' }]}
            actions={<ButtonLink href="/booking">Записаться</ButtonLink>}
          />
        ) : null}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard key={offer.slug} offer={offer} />
          ))}
        </div>
      </Container>

      <CtaPanel
        eyebrow="Запись"
        title="Выберите предложение и запланируйте визит."
        description="Если акция вам подходит, переходите к записи или задайте вопрос по сертификатам и форматам визита."
        actions={
          <>
            <ButtonLink href="/booking">Записаться</ButtonLink>
            <ButtonLink href="/gift-cards" variant="secondary">
              Сертификаты
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
