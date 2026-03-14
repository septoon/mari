import { siteConfig } from '@/lib/site';

export function ContextNote({
  service,
  master,
  location,
  offer
}: {
  service?: string;
  master?: string;
  location?: string;
  offer?: string;
}) {
  const items = [
    service ? `Услуга: ${service}` : null,
    master ? `Мастер: ${master}` : null,
    location ? `Филиал: ${location}` : null,
    offer ? `Акция: ${offer}` : null
  ].filter(Boolean);

  if (!items.length) {
    return null;
  }

  return (
    <div className="rounded-[1.6rem] border border-[color:var(--line)] bg-white/78 p-5 text-sm leading-7 text-[color:var(--muted)]">
      <p className="text-xs uppercase tracking-[0.28em] text-[color:var(--muted-strong)]">Вы уже выбрали</p>
      <p className="mt-3">
        {items.join(' · ')}. Если хотите быстрее подобрать удобное время, позвоните нам: {siteConfig.phone}.
      </p>
    </div>
  );
}
