import { siteConfig } from '@/lib/site';

export function ContextNote({
  service,
  master,
  location,
  offer,
  phone = siteConfig.phone
}: {
  service?: string;
  master?: string;
  location?: string;
  offer?: string;
  phone?: string;
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
    <div className="rounded-[1.6rem] border border-(--line) bg-white/78 p-5 text-sm leading-7 text-(--muted)">
      <p className="text-xs uppercase tracking-[0.28em] text-(--muted-strong)">Вы уже выбрали</p>
      <p className="mt-3">
        {items.join(' · ')}. Если хотите быстрее подобрать удобное время, позвоните нам: {phone}.
      </p>
    </div>
  );
}
