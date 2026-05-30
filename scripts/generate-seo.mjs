import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const unquoteEnvValue = (value) => {
  const trimmed = value.trim();
  const quote = trimmed[0];

  if ((quote === '"' || quote === "'") && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
};

const loadEnvFiles = () => {
  const envValues = new Map();

  for (const fileName of ['.env', '.env.local']) {
    const envPath = resolve(process.cwd(), fileName);
    if (!existsSync(envPath)) {
      continue;
    }

    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }

      const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (match) {
        envValues.set(match[1], unquoteEnvValue(match[2]));
      }
    }
  }

  for (const [key, value] of envValues) {
    process.env[key] ??= value;
  }
};

loadEnvFiles();

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://maribeauty.ru').replace(/\/+$/, '');
const backendBaseUrl = (process.env.MARI_SERVER_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
const webAppVersion = process.env.NEXT_PUBLIC_APP_VERSION?.trim() || undefined;
const nextDir = resolve(process.cwd(), '.next');
const publicDir = resolve(process.cwd(), 'public');
const now = new Date().toISOString();

const excludedRoutes = new Set([
  '/_global-error',
  '/_not-found',
  '/account',
  '/account/login',
  '/account/recover',
  '/account/register',
  '/feed.yml',
  '/favicon.ico',
  '/icon.svg',
  '/manifest.webmanifest',
  '/reset-password'
]);

const redirectOnlyRoutes = new Set(['/locations']);
const redirectOnlyRoutePrefixes = ['/locations/'];

const routePageKeys = new Map([
  ['/', 'home'],
  ['/about', 'about'],
  ['/booking', 'booking'],
  ['/careers', 'careers'],
  ['/contacts', 'contacts'],
  ['/gallery', 'gallery'],
  ['/gift-cards', 'giftCards'],
  ['/masters', 'masters'],
  ['/news', 'news'],
  ['/offers', 'offers'],
  ['/prices', 'prices'],
  ['/privacy-policy', 'privacyPolicy'],
  ['/services', 'services'],
]);

const routePrefixPageKeys = [
  ['/masters/', 'masters'],
  ['/news/', 'news'],
  ['/offers/', 'offers'],
  ['/services/', 'services'],
];

const isPublicRoute = (route) =>
  route &&
  !route.startsWith('/api/') &&
  !route.includes('/(.)') &&
  !route.startsWith('/@') &&
  !excludedRoutes.has(route);

const normalizeRoute = (route) => (route === '/index' ? '/' : route);

const getPriority = (route) => {
  if (route === '/') {
    return '1.0';
  }

  if (route === '/booking' || route === '/services' || route === '/masters') {
    return '0.9';
  }

  if (route.startsWith('/services/')) {
    return '0.8';
  }

  if (route.startsWith('/masters/') || route === '/prices' || route === '/offers') {
    return '0.7';
  }

  return '0.6';
};

const getChangefreq = (route) => {
  if (route === '/' || route === '/booking') {
    return 'daily';
  }

  if (
    route === '/services' ||
    route === '/masters' ||
    route === '/prices' ||
    route === '/offers' ||
    route.startsWith('/services/')
  ) {
    return 'weekly';
  }

  return 'monthly';
};

const buildAbsoluteUrl = (route) => `${siteUrl}${route === '/' ? '' : route}`;

const translitMap = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'i',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'cz',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

const slugify = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .split('')
    .map((char) => translitMap[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

const asObjectRecord = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value;
};

const readSiteHiddenBlockKeys = (extra) => {
  const siteVisibility = asObjectRecord(asObjectRecord(extra).siteVisibility);
  const hiddenBlockKeys = siteVisibility.hiddenBlockKeys;

  if (!Array.isArray(hiddenBlockKeys)) {
    return new Set();
  }

  return new Set(
    hiddenBlockKeys
      .filter((item) => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean),
  );
};

const isSiteBlockVisible = (hiddenBlockKeys, blockKey) => !hiddenBlockKeys.has(blockKey);

const isRedirectOnlyRoute = (route) =>
  redirectOnlyRoutes.has(route) || redirectOnlyRoutePrefixes.some((prefix) => route.startsWith(prefix));

const getRoutePageKey = (route) => {
  const exactPageKey = routePageKeys.get(route);
  if (exactPageKey) {
    return exactPageKey;
  }

  return routePrefixPageKeys.find(([prefix]) => route.startsWith(prefix))?.[1] ?? null;
};

const isIndexableRoute = (route, hiddenBlockKeys) => {
  if (isRedirectOnlyRoute(route)) {
    return false;
  }

  const pageKey = getRoutePageKey(route);
  return pageKey ? isSiteBlockVisible(hiddenBlockKeys, `page:${pageKey}`) : true;
};

const buildUniqueSlugs = (items, pickValue) => {
  const counts = new Map();

  return items.map((item) => {
    const base = slugify(pickValue(item)) || 'item';
    const next = (counts.get(base) ?? 0) + 1;
    counts.set(base, next);
    return next === 1 ? base : `${base}-${next}`;
  });
};

const escapeXml = (value) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const sortRoutes = (left, right) => {
  if (left === '/') {
    return -1;
  }

  if (right === '/') {
    return 1;
  }

  return left.localeCompare(right, 'en');
};

const buildSitemapXml = (routes) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(buildAbsoluteUrl(route))}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${getChangefreq(route)}</changefreq>
    <priority>${getPriority(route)}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const buildRobotsTxt = () => {
  const host = new URL(siteUrl).host;

  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /account
Disallow: /account/login
Disallow: /account/register
Disallow: /account/recover
Disallow: /reset-password

Host: ${host}
Sitemap: ${siteUrl}/sitemap.xml
`;
};

const readJson = async (path, fallback = null) => {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return fallback;
    }
    throw error;
  }
};

const readApiPayload = async (path) => {
  const url = new URL(path, backendBaseUrl);

  if (webAppVersion && path.startsWith('/client-front/bootstrap')) {
    url.searchParams.set('appVersion', webAppVersion);
  }

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Request failed for ${url} with status ${response.status}`);
  }

  const payload = await response.json();
  return payload?.data ?? null;
};

const getSitemapSource = async () => {
  try {
    const [bootstrap, servicesPayload] = await Promise.all([
      readApiPayload('/client-front/bootstrap?platform=web'),
      readApiPayload('/services/public'),
    ]);

    const hiddenBlockKeys = readSiteHiddenBlockKeys(bootstrap?.config?.extra);
    const services = Array.isArray(servicesPayload?.items) ? servicesPayload.items : [];
    const specialists = Array.isArray(bootstrap?.specialists) ? bootstrap.specialists : [];
    const visibleSpecialists = specialists.filter(
      (item) => item?.isVisible && item?.isActive && !item?.firedAt,
    );

    const categorySource = services.reduce((acc, service) => {
      const categoryId = service?.category?.id;
      if (!categoryId || acc.some((item) => item.id === categoryId)) {
        return acc;
      }

      acc.push({
        id: categoryId,
        name: service.category.name,
        section: service.category.section
          ? {
              id: service.category.section.id,
              name: service.category.section.name,
              orderIndex: service.category.section.orderIndex ?? 0,
            }
          : null,
      });
      return acc;
    }, []);

    const categorySlugs = buildUniqueSlugs(categorySource, (item) => item.name);
    const categorySlugById = new Map(
      categorySource.map((item, index) => [item.id, categorySlugs[index]]),
    );

    const sectionSource = categorySource
      .filter((item) => item.section?.id)
      .reduce((acc, item) => {
        if (!item.section || acc.some((entry) => entry.id === item.section.id)) {
          return acc;
        }
        acc.push(item.section);
        return acc;
      }, [])
      .sort((left, right) => left.orderIndex - right.orderIndex);

    const sectionSlugs = buildUniqueSlugs(sectionSource, (item) => item.name);
    const sectionSlugById = new Map(
      sectionSource.map((item, index) => [item.id, sectionSlugs[index]]),
    );

    const specialistSlugs = buildUniqueSlugs(visibleSpecialists, (item) => item.name);

    const serviceSlugsByCategory = new Map();
    const serviceRoutes = services.map((service) => {
      const categorySlug =
        categorySlugById.get(service?.category?.id) ?? slugify(service?.category?.name);
      const currentMap = serviceSlugsByCategory.get(categorySlug) ?? new Map();
      const base = slugify(service?.nameOnline || service?.name) || 'service';
      const next = (currentMap.get(base) ?? 0) + 1;
      currentMap.set(base, next);
      serviceSlugsByCategory.set(categorySlug, currentMap);
      const serviceSlug = next === 1 ? base : `${base}-${next}`;

      return `/services/${categorySlug}/${serviceSlug}`;
    });

    const categoryRoutes = categorySource.map(
      (item) => `/services/${categorySlugById.get(item.id) ?? slugify(item.name)}`,
    );
    const sectionRoutes = sectionSource.map(
      (item) => `/services/section/${sectionSlugById.get(item.id) ?? slugify(item.name)}`,
    );
    const masterRoutes = visibleSpecialists.map(
      (item, index) => `/masters/${specialistSlugs[index] ?? slugify(item.name)}`,
    );

    return {
      dynamicCatalogRoutes: [...sectionRoutes, ...categoryRoutes, ...serviceRoutes, ...masterRoutes],
      hiddenBlockKeys,
    };
  } catch (error) {
    console.warn('[generate:seo] dynamic routes fetch skipped');
    console.warn(error instanceof Error ? error.message : error);
    return {
      dynamicCatalogRoutes: [],
      hiddenBlockKeys: new Set(),
    };
  }
};

const main = async () => {
  const routesManifest = await readJson(resolve(nextDir, 'routes-manifest.json'), { staticRoutes: [] });
  const prerenderManifest = await readJson(resolve(nextDir, 'prerender-manifest.json'), { routes: {} });
  const { dynamicCatalogRoutes, hiddenBlockKeys } = await getSitemapSource();

  const staticRoutes = (routesManifest.staticRoutes ?? [])
    .map((item) => normalizeRoute(item.page))
    .filter(isPublicRoute);

  const prerenderRoutes = Object.keys(prerenderManifest.routes ?? {})
    .map(normalizeRoute)
    .filter(isPublicRoute);

  const routes = [...new Set([...staticRoutes, ...prerenderRoutes, ...dynamicCatalogRoutes])]
    .filter(isPublicRoute)
    .filter((route) => isIndexableRoute(route, hiddenBlockKeys))
    .sort(sortRoutes);

  await mkdir(publicDir, { recursive: true });
  await writeFile(resolve(publicDir, 'sitemap.xml'), buildSitemapXml(routes), 'utf8');
  await writeFile(resolve(publicDir, 'robots.txt'), buildRobotsTxt(), 'utf8');

  console.log(`[generate:seo] sitemap.xml updated with ${routes.length} urls`);
  console.log('[generate:seo] robots.txt updated');
};

main().catch((error) => {
  console.error('[generate:seo] failed');
  console.error(error);
  process.exitCode = 1;
});
