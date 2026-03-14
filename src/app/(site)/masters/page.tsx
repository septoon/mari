import { CtaPanel } from '@/components/site/cta-panel';
import { MastersBrowser } from '@/components/site/masters-browser';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { createPageMetadata } from '@/lib/site';
import { getLiveCatalog } from '@/lib/live-catalog';

export const metadata = createPageMetadata({
  title: 'Специалисты',
  description:
    'Специалисты MARI: направления работы и запись на услуги.',
  path: '/masters'
});

export default async function MastersPage() {
  const catalog = await getLiveCatalog();

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow="Специалисты"
          title="Специалисты, которым доверяют постоянные гости."
          description="Познакомьтесь со специалистами MARI, их направлениями и услугами, на которые можно записаться."
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Специалисты' }]}
          actions={<ButtonLink href="/booking">Записаться</ButtonLink>}
          details={[
            `${catalog.specialists.length} специалистов в каталоге.`,
            'Фильтр по специализации помогает быстро сузить выбор.'
          ]}
        />

        <MastersBrowser masters={catalog.specialists} />
      </Container>

      <CtaPanel
        eyebrow="Выбор специалиста"
        title="Выберите специалиста и перейдите к записи."
        description="На странице специалиста собраны направления работы, услуги и удобный переход к ближайшему визиту."
        actions={
          <>
            <ButtonLink href="/booking">Записаться</ButtonLink>
            <ButtonLink href="/services" variant="secondary">
              Смотреть услуги
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
