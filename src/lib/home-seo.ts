import { siteConfig, siteImageUrl, siteSeoConfig, siteUrl } from '@/lib/site';

type BeautySalonJsonLdInput = {
  phone: string;
  mapUrl?: string;
};

export const buildBeautySalonJsonLd = ({ phone, mapUrl }: BeautySalonJsonLdInput) => ({
  '@context': 'https://schema.org',
  '@type': 'BeautySalon',
  '@id': `${siteUrl}/#beauty-salon`,
  name: siteConfig.name,
  description: siteSeoConfig.home.description,
  url: siteUrl,
  image: [siteImageUrl, `${siteUrl}/logo.webp`],
  telephone: phone,
  priceRange: siteSeoConfig.priceRange,
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteSeoConfig.streetAddress,
    addressLocality: siteSeoConfig.city,
    addressRegion: siteSeoConfig.region,
    addressCountry: siteSeoConfig.countryCode,
  },
  openingHours: siteSeoConfig.openingHours,
  geo: {
    '@type': 'GeoCoordinates',
    latitude: siteSeoConfig.geo.latitude,
    longitude: siteSeoConfig.geo.longitude,
  },
  hasMap: mapUrl,
  sameAs: siteSeoConfig.sameAs,
});
