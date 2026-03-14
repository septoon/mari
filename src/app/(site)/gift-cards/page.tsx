import { CtaPanel } from '@/components/site/cta-panel';
import { EditorialVisual } from '@/components/site/editorial-visual';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Подарочные сертификаты',
  description: 'Подарочные сертификаты Mari для услуг, beauty-дней и premium-ухода.',
  path: '/gift-cards'
});

const packages = [
  {
    title: 'Signature',
    note: 'Номинал 10 000 ₽',
    text: 'Для первого знакомства с Mari и выбора нескольких ключевых сервисов.'
  },
  {
    title: 'Beauty Day',
    note: 'Номинал 20 000 ₽',
    text: 'Подходит для комбинированного визита: волосы, лицо, brows или body-care.'
  },
  {
    title: 'Club Gift',
    note: 'Свободный номинал',
    text: 'Персональный сценарий для подарка с custom-сообщением и цифровой отправкой.'
  }
];

export default function GiftCardsPage() {
  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow="Подарочные сертификаты"
          title="Подарочные сертификаты MARI."
          description="Выберите номинал, формат подарка и подарите близкому красивый визит в салон."
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Подарочные сертификаты' }]}
          actions={
            <>
              <ButtonLink href="/booking">Оформить сертификат</ButtonLink>
              <ButtonLink href="/contacts" variant="secondary">
                Задать вопрос
              </ButtonLink>
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <EditorialVisual
            label="Gift cards"
            title="Подарок, который легко выбрать и приятно дарить."
            subtitle="Сертификат подойдёт для первого знакомства с салоном, любимой процедуры или полноценного beauty-дня."
            className="min-h-[25rem]"
          />

          <div className="grid gap-6">
            {packages.map((item) => (
              <article key={item.title} className="surface-card p-6">
                <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">{item.note}</p>
                <h2 className="mt-4 font-serif text-4xl text-[color:var(--ink)]">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Container>

      <CtaPanel
        eyebrow="Покупка"
        title="Подберите сертификат и уточните удобный способ оформления."
        description="Мы поможем выбрать номинал, формат отправки и подскажем, как лучше использовать сертификат."
        actions={
          <>
            <ButtonLink href="/booking">Оформить сертификат</ButtonLink>
            <ButtonLink href="/offers" variant="secondary">
              Смотреть предложения
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
