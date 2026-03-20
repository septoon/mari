import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getLiveCatalog } from '@/lib/live-catalog';
import { createPageMetadata } from '@/lib/site';
import { getSitePrivacyPolicyContent } from '@/lib/site-content';

export const metadata = createPageMetadata({
  title: 'Политика конфиденциальности',
  description: 'Стандартная политика конфиденциальности и обработки персональных данных сайта MARI Beauty Salon.',
  path: '/privacy-policy'
});

export default async function PrivacyPolicyPage() {
  const [catalog, content] = await Promise.all([getLiveCatalog(), getSitePrivacyPolicyContent()]);
  const operatorName =
    catalog.bootstrap.config.legalName?.trim() ||
    catalog.bootstrap.config.brandName?.trim() ||
    catalog.salon.name;

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Политика конфиденциальности' }]}
          actions={
            <>
              <ButtonLink href={`mailto:${catalog.salon.email}`}>{content.contactCtaLabel}</ButtonLink>
              <ButtonLink href="/contacts" variant="secondary">
                Контакты
              </ButtonLink>
            </>
          }
        />

        <section className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="surface-card p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">{content.summaryEyebrow}</p>
            <h2 className="mt-4 font-serif text-4xl text-(--ink)">{content.summaryTitle}</h2>
            <div className="mt-6 space-y-4 text-sm leading-7 text-(--muted)">
              <p>
                {content.operatorLabel}: <span className="font-semibold text-(--foreground)">{operatorName}</span>
              </p>
              <p>
                {content.contactLabel}:
                {' '}
                <a href={`mailto:${catalog.salon.email}`} className="font-semibold text-(--foreground) transition hover:text-(--accent-strong)">
                  {catalog.salon.email}
                </a>
              </p>
              <p>{content.addressLabel}: {catalog.salon.address}</p>
              <p>{content.summaryNote}</p>
            </div>
          </aside>

          <div className="space-y-5">
            {content.sections.map((section) => (
              <article key={section.id} className="surface-card p-6 md:p-8">
                <h2 className="font-serif text-3xl text-(--ink)">{section.title}</h2>
                <div className="prose-copy mt-5 text-sm leading-7 text-(--muted)">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
