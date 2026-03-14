import { CtaPanel } from '@/components/site/cta-panel';
import { MastersBrowser } from '@/components/site/masters-browser';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';

export const metadata = createPageMetadata({
  title: 'Мастера',
  description:
    'Мастера MARI: специалисты, направления работы и запись на услуги.',
  path: '/masters'
});

export default async function MastersPage() {
  const catalog = await getLiveCatalog();

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow="Мастера"
          title="Мастера, которым доверяют постоянные гости."
          description="Познакомьтесь со специалистами MARI, их направлениями и услугами, на которые можно записаться."
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Мастера' }]}
          actions={<ButtonLink href="/contacts#booking">Записаться</ButtonLink>}
          details={[
            `${catalog.specialists.length} мастеров в каталоге.`,
            'Фильтр по специализации помогает быстро сузить выбор.'
          ]}
        />

        <MastersBrowser masters={catalog.specialists} />
      </Container>

      <CtaPanel
        eyebrow="Выбор мастера"
        title="Выберите специалиста и перейдите к записи."
        description="На странице мастера собраны направления работы, услуги и удобный переход к ближайшему визиту."
        actions={
          <>
            <ButtonLink href="/contacts#booking">Записаться</ButtonLink>
            <ButtonLink href="/services" variant="secondary">
              Смотреть услуги
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
