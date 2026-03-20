import { ChevronRight, MessageCircleMore, Sparkles } from 'lucide-react';

import { formatCurrency } from '@/lib/format';
import type { ClientContentBlock, ContactPoint } from '@/lib/api/contracts';

type BlocksRendererProps = {
  blocks: ClientContentBlock[];
  contacts: ContactPoint[];
};

const fallbackFaq = [
  {
    question: 'Как подтвердить запись?',
    answer: 'После оформления визит сразу появится в личном кабинете. Там же можно посмотреть детали и при необходимости отменить запись.'
  },
  {
    question: 'Можно ли записаться без кабинета?',
    answer: 'Нет. Для завершения записи нужен личный кабинет, чтобы сохранить историю визитов и управлять ими в одном месте.'
  },
  {
    question: 'Свободное время показывается сразу?',
    answer: 'Да. Вы видите только те окна, которые доступны для выбранных услуг, даты и мастера.'
  }
];

const renderContactCards = (items: ContactPoint[]) => (
  <div className="grid gap-4 lg:grid-cols-2">
    {items.map((contact) => {
      const primaryPhone = contact.phones.find((phone) => phone.primary) ?? contact.phones[0];
      const primaryAddress = contact.addresses[0];

      return (
        <article
          key={contact.id}
          className="rounded-[1.5rem] border border-(--line) bg-white/78 p-5 shadow-[0_20px_45px_rgba(12,77,85,0.06)]"
        >
          <p className="text-xs uppercase tracking-[0.24em] text-(--ink-muted)">
            {contact.publicName || contact.name}
          </p>
          <h3 className="mt-3 font-serif text-3xl text-(--ink)">{primaryAddress?.label || 'Контакт'}</h3>
          <p className="mt-3 text-sm leading-6 text-(--ink-muted)">
            {[primaryAddress?.line1, primaryAddress?.city, primaryAddress?.comment].filter(Boolean).join(', ')}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {primaryPhone ? (
                <a
                  href={`tel:${primaryPhone.e164}`}
                  className="inline-flex items-center gap-2 rounded-full bg-(--button-bg) px-4 py-2 text-sm font-medium text-white"
                >
                {primaryPhone.display || primaryPhone.e164}
              </a>
            ) : null}
            {contact.mapUrl ? (
              <a
                href={contact.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-(--line) px-4 py-2 text-sm text-(--ink)"
              >
                Открыть карту
                <ChevronRight className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </article>
      );
    })}
  </div>
);

export function BlocksRenderer({ blocks, contacts }: BlocksRendererProps) {
  const promoBlocks = blocks.filter((block) => block.blockType === 'PROMO');
  const offerBlocks = blocks.filter((block) => block.blockType === 'OFFERS');
  const textBlocks = blocks.filter((block) => block.blockType === 'TEXT');
  const faqBlocks = blocks.filter((block) => block.blockType === 'FAQ');
  const contactBlocks = blocks.filter((block) => block.blockType === 'CONTACTS');

  const faqItems = faqBlocks.flatMap((block) => block.payload.items);
  const contactItems = contactBlocks.flatMap((block) => block.payload.items);
  const contactsToRender = contactItems.length > 0 ? contactItems : contacts;

  return (
    <div className="space-y-8">
      {promoBlocks.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {promoBlocks.map((block) => (
            <article
              key={block.id}
              className="rounded-[2rem] border border-(--line) bg-[linear-gradient(135deg,rgba(233,239,237,0.88),rgba(255,255,255,0.95))] p-6 shadow-[0_25px_70px_rgba(12,77,85,0.06)]"
            >
              <p className="inline-flex items-center gap-2 rounded-full border border-(--line) px-4 py-2 text-xs uppercase tracking-[0.28em] text-(--ink-muted)">
                <Sparkles className="h-4 w-4" />
                {block.payload.badge || 'Спецпредложение'}
              </p>
              <h2 className="mt-5 font-serif text-4xl text-(--ink)">{block.payload.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-(--ink-muted)">
                {block.payload.description || 'Актуальное предложение для тех, кто хочет собрать красивый и удобный визит.'}
              </p>
              {block.payload.ctaUrl && block.payload.ctaText ? (
                <a
                  href={block.payload.ctaUrl}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-(--button-bg) px-5 py-3 text-sm font-medium text-white"
                >
                  {block.payload.ctaText}
                  <ChevronRight className="h-4 w-4" />
                </a>
              ) : null}
            </article>
          ))}
        </section>
      ) : null}

      {offerBlocks.length > 0 ? (
        <section className="rounded-[2rem] border border-(--line) bg-white/74 px-6 py-8 shadow-[0_25px_70px_rgba(12,77,85,0.06)]">
          <div className="max-w-2xl">
            <p className="section-kicker">Подборки</p>
            <h2 className="section-title">{offerBlocks[0]?.payload.title || 'Собранные предложения для быстрых решений.'}</h2>
          </div>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {offerBlocks.flatMap((block) => block.payload.items).map((offer) => (
              <article key={offer.id} className="rounded-[1.5rem] border border-(--line) bg-(--panel) p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-(--ink-muted)">
                  {offer.subtitle || 'Offer'}
                </p>
                <h3 className="mt-3 font-serif text-3xl text-(--ink)">{offer.title}</h3>
                <p className="mt-3 text-sm leading-6 text-(--ink-muted)">
                  {offer.description || 'Продуманный формат визита для тех, кто хочет больше заботы за одно посещение.'}
                </p>
                <div className="mt-5 flex items-baseline gap-3">
                  {offer.finalPrice ? (
                    <p className="text-2xl font-semibold text-(--ink)">{formatCurrency(offer.finalPrice)}</p>
                  ) : null}
                  {offer.originalPrice ? (
                    <p className="text-sm text-(--ink-muted) line-through">{formatCurrency(offer.originalPrice)}</p>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {textBlocks.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {textBlocks.map((block) => (
            <article
              key={block.id}
              className="rounded-[1.7rem] border border-(--line) bg-(--panel-strong) p-6"
            >
              {block.payload.title ? <p className="section-kicker">{block.payload.title}</p> : null}
              <div className="mt-3 whitespace-pre-line text-sm leading-7 text-(--ink-muted)">{block.payload.body}</div>
            </article>
          ))}
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-(--line) bg-white/78 px-6 py-8 shadow-[0_25px_70px_rgba(12,77,85,0.06)]">
        <div className="max-w-2xl">
          <p className="section-kicker">FAQ</p>
          <h2 className="section-title">Что важно знать перед визитом.</h2>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {(faqItems.length > 0 ? faqItems : fallbackFaq).map((item) => (
            <article key={item.question} className="rounded-[1.5rem] border border-(--line) bg-(--panel) p-5">
              <p className="inline-flex items-center gap-2 text-sm font-medium text-(--ink)">
                <MessageCircleMore className="h-4 w-4" />
                {item.question}
              </p>
              <p className="mt-3 text-sm leading-6 text-(--ink-muted)">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      {contactsToRender.length > 0 ? (
        <section id="contacts" className="space-y-6">
          <div className="max-w-2xl">
            <p className="section-kicker">Контакты</p>
            <h2 className="section-title">Как нас найти и связаться с нами.</h2>
          </div>
          {renderContactCards(contactsToRender)}
        </section>
      ) : null}
    </div>
  );
}
