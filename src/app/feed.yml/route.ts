import { getLiveCatalog } from '@/lib/live-catalog';
import { defaultMetaImage, siteConfig, siteUrl } from '@/lib/site';

export const revalidate = 300;

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const wrap = (tag: string, value: string | number) => `<${tag}>${xmlEscape(String(value))}</${tag}>`;

const formatYmlDate = (date: Date) => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

export async function GET() {
  const catalog = await getLiveCatalog();
  const categories = catalog.serviceCategories
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name, 'ru'));
  const categoryIds = new Map(categories.map((category, index) => [category.id, index + 1]));
  const offers = catalog.services
    .slice()
    .sort((left, right) => left.displayName.localeCompare(right.displayName, 'ru'))
    .map((service) => {
      const serviceUrl = `${siteUrl}/services/${service.categorySlug}/${service.slug}`;
      const bookingUrl = `${siteUrl}/booking?service=${encodeURIComponent(service.slug)}`;
      const imageUrl =
        service.imageUrl || service.category.imageUrl || defaultMetaImage.url || `${siteUrl}/image.webp`;
      const description =
        service.description?.trim() ||
        service.teaser ||
        `${service.displayName}. Длительность ${Math.round(service.durationSec / 60)} мин.`;

      return [
        `<offer id="${xmlEscape(service.externalId?.trim() || service.id)}" available="true">`,
        wrap('name', service.displayName),
        wrap('url', serviceUrl),
        wrap('price', service.priceMin),
        wrap('currencyId', 'RUR'),
        wrap('categoryId', categoryIds.get(service.category.id) ?? service.category.id),
        wrap('picture', imageUrl),
        wrap('description', description),
        wrap('sales_notes', 'Онлайн-запись доступна на сайте'),
        `<param name="duration_minutes">${Math.round(service.durationSec / 60)}</param>`,
        `<param name="booking_url">${xmlEscape(bookingUrl)}</param>`,
        `</offer>`,
      ].join('');
    });

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<yml_catalog date="${formatYmlDate(new Date())}">`,
    `<shop>`,
    wrap('name', siteConfig.shortName),
    wrap('company', siteConfig.name),
    wrap('url', siteUrl),
    wrap('email', siteConfig.email),
    `<currencies><currency id="RUR" rate="1"/></currencies>`,
    `<categories>`,
    ...categories.map((category) =>
      `<category id="${categoryIds.get(category.id) ?? category.id}">${xmlEscape(category.name)}</category>`,
    ),
    `</categories>`,
    `<offers>`,
    ...offers,
    `</offers>`,
    `</shop>`,
    `</yml_catalog>`,
  ].join('');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
