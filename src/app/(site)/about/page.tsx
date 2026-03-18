import { PageHero } from '@/components/site/page-hero';
import { Container } from '@/components/ui/container';
import { ButtonLink } from '@/components/ui/button';
import { getClientBootstrap } from '@/lib/api/backend';
import { resolveSitePageHero } from '@/lib/site-page-heroes';
import { createPageMetadata } from '@/lib/site';

export const metadata = createPageMetadata({
  title: 'О салоне',
  description: 'О салоне MARI: атмосфера, подход к сервису и философия ухода.',
  path: '/about'
});

const principles = [
  {
    title: 'Спокойная эстетика',
    text: 'В MARI важны чистые линии, тёплая атмосфера и внимание к деталям без визуального шума.'
  },
  {
    title: 'Уважение к времени',
    text: 'Мы ценим точность и комфорт, поэтому путь от выбора услуги до записи остаётся простым и понятным.'
  },
  {
    title: 'Профессиональный подход',
    text: 'Каждая процедура подбирается с учётом задачи, состояния волос или кожи и желаемого результата.'
  }
];

export default async function AboutPage() {
  const bootstrap = await getClientBootstrap();
  const hero = resolveSitePageHero('about', bootstrap.config.extra);

  return (
    <main className="pb-14">
      <Container>
        <PageHero
          eyebrow={hero.eyebrow}
          title={hero.title}
          description={hero.description}
          breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'О салоне' }]}
          actions={<ButtonLink href="/booking">Записаться</ButtonLink>}
        />

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="surface-card p-8">
            <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">История бренда</p>
            <h2 className="mt-4 font-serif text-4xl text-[color:var(--ink)]">Место для ухода, отдыха и точной работы с образом.</h2>
            <p className="mt-5 text-sm leading-7 text-[color:var(--muted)]">
              В MARI приходят за красивым результатом, спокойной атмосферой и сервисом, в котором ничего не отвлекает от главного.
            </p>
            <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
              Мы хотим, чтобы и на сайте, и в салоне вы чувствовали одно и то же: аккуратность, комфорт и уважение к вашему времени.
            </p>
          </article>

          <div className="grid gap-6">
            {principles.map((item) => (
              <article key={item.title} className="surface-card p-6">
                <h3 className="font-serif text-3xl text-[color:var(--ink)]">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </Container>

      <section className="py-10 md:py-14">
        <Container>
          <div className="rounded-[2rem] border border-[color:var(--line)] bg-[#1d5055] px-6 py-8 text-white shadow-[0_35px_100px_rgba(20,15,12,0.16)] md:px-10 md:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.28em] text-white/60">Отзывы гостей</p>
                <h2 className="mt-5 font-serif text-4xl leading-[1.02] md:text-5xl">
                  Нас выбирают за атмосферу, сервис и результат.
                </h2>
                <p className="mt-5 text-sm leading-7 text-white/72 md:text-base md:leading-8">
                  Для нас важно, чтобы каждый визит оставлял ощущение лёгкости, заботы и точного попадания в запрос. Поэтому
                  живые отзывы гостей говорят о MARI лучше любых обещаний.
                </p>
                <p className="mt-6 text-sm leading-7 text-white/60">
                  Если хотите составить впечатление заранее, почитайте отзывы и затем выберите удобное время для визита.
                </p>
              </div>

              <div
                className="relative mx-auto h-[720px] w-full max-w-[560px] overflow-hidden"
                style={{
                  position: 'relative'
                }}
              >
                <iframe
                  title="Отзывы о MARI на Яндекс Картах"
                  src="https://yandex.ru/maps-reviews-widget/36627385481?comments"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: '1px solid #e6e6e6',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
                <a
                  href="https://yandex.com/maps/org/mari/36627385481/"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    boxSizing: 'border-box',
                    textDecoration: 'none',
                    color: '#b3b3b3',
                    fontSize: '10px',
                    fontFamily: 'YS Text,sans-serif',
                    position: 'absolute',
                    bottom: '8px',
                    width: '100%',
                    textAlign: 'center',
                    left: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    maxHeight: '14px',
                    whiteSpace: 'nowrap',
                    padding: '0 16px'
                  }}
                >
                  MARi на карте Республики Крым — Яндекс Карты
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
