import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001').replace(/\/+$/, '');
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
  '/favicon.ico',
  '/icon.svg',
  '/manifest.webmanifest',
  '/reset-password'
]);

const isPublicRoute = (route) =>
  route &&
  !route.startsWith('/api/') &&
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

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

const main = async () => {
  const routesManifest = await readJson(resolve(nextDir, 'routes-manifest.json'));
  const prerenderManifest = await readJson(resolve(nextDir, 'prerender-manifest.json'));

  const staticRoutes = (routesManifest.staticRoutes ?? [])
    .map((item) => normalizeRoute(item.page))
    .filter(isPublicRoute);

  const prerenderRoutes = Object.keys(prerenderManifest.routes ?? {})
    .map(normalizeRoute)
    .filter(isPublicRoute);

  const routes = [...new Set([...staticRoutes, ...prerenderRoutes])].sort(sortRoutes);

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
