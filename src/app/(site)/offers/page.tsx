import { OfferCard } from '@/components/cards/offer-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getOffers } from '@/content/queries';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Акции',
  description: 'Акции и специальные предложения Mari.',
  path: '/offers'
});

export default function OffersPage() {
  const offers = getOffers();

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow="Акции"
          title="Специальные предложения MARI."
          description="Здесь собраны выгодные форматы визитов, бонусы и идеи для тех, кто хочет попробовать больше за один визит."
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Акции' }]}
          actions={<ButtonLink href="/contacts#booking">Записаться</ButtonLink>}
        />

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
            <ButtonLink href="/contacts#booking">Записаться</ButtonLink>
            <ButtonLink href="/gift-cards" variant="secondary">
              Сертификаты
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
