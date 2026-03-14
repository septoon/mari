import { GalleryCard } from '@/components/cards/gallery-card';
import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getGalleryMoments } from '@/content/queries';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Галерея',
  description: 'Галерея Mari: моменты услуг, интерьера и moodboard бренда.',
  path: '/gallery'
});

export default function GalleryPage() {
  const moments = getGalleryMoments();

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow="Галерея"
          title="Галерея настроения, образов и пространства MARI."
          description="Собрали здесь детали, которые передают атмосферу салона, характер процедур и наше отношение к красоте."
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Галерея' }]}
          actions={<ButtonLink href="/booking">Записаться</ButtonLink>}
        />

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {moments.map((moment) => (
            <GalleryCard key={moment.slug} moment={moment} />
          ))}
        </div>
      </Container>

      <CtaPanel
        eyebrow="После вдохновения"
        title="Если настроение найдено, переходите к услугам и записи."
        description="После галереи можно выбрать направление, мастера или сразу подобрать время визита."
        actions={
          <>
            <ButtonLink href="/services">Смотреть услуги</ButtonLink>
            <ButtonLink href="/booking" variant="secondary">
              Записаться
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
