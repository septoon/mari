import { CtaPanel } from '@/components/site/cta-panel';
import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getJobOpenings } from '@/content/queries';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'Вакансии',
  description: 'Вакансии Mari: мастера, косметологи и сервисная команда.',
  path: '/careers'
});

export default function CareersPage() {
  const jobs = getJobOpenings();

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow="Вакансии"
          title="Присоединяйтесь к команде MARI."
          description="Ищем мастеров и сервисных специалистов, которым близки аккуратный подход, уважение к гостю и любовь к красивому результату."
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Вакансии' }]}
          actions={<ButtonLink href="mailto:hr@maribeauty.ru">Откликнуться</ButtonLink>}
        />

        <div className="grid gap-6">
          {jobs.map((job) => (
            <article key={job.slug} className="surface-card p-6 md:p-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">
                    {job.location} · {job.schedule}
                  </p>
                  <h2 className="mt-4 font-serif text-4xl text-[color:var(--ink)]">{job.title}</h2>
                </div>
                <ButtonLink href="mailto:hr@maribeauty.ru" variant="secondary" size="sm">
                  Отправить резюме
                </ButtonLink>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">{job.description}</p>
              <ul className="mt-6 grid gap-3 md:grid-cols-3">
                {job.requirements.map((item) => (
                  <li key={item} className="rounded-[1.5rem] border border-[color:var(--line)] bg-white/72 p-4 text-sm leading-7 text-[color:var(--muted)]">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>

      <CtaPanel
        eyebrow="Команда Mari"
        title="Если вам близок подход MARI, отправляйте резюме."
        description="Расскажите о себе, опыте и специализации, а мы свяжемся с вами по поводу следующего шага."
        actions={
          <>
            <ButtonLink href="mailto:hr@maribeauty.ru">Откликнуться</ButtonLink>
            <ButtonLink href="/about" variant="secondary">
              О бренде
            </ButtonLink>
          </>
        }
      />
    </main>
  );
}
