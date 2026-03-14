import {
  galleryMoments,
  jobOpenings,
  locations,
  masters,
  news,
  offers,
  reviews,
  serviceCategories,
  services
} from '@/content/site-data';

export const getServiceCategories = () => serviceCategories;

export const getServiceCategory = (slug: string) =>
  serviceCategories.find((category) => category.slug === slug) ?? null;

export const getServices = () => services;

export const getFeaturedServices = () => services.filter((service) => service.featured);

export const getServicesByCategory = (categorySlug: string) =>
  services.filter((service) => service.categorySlug === categorySlug);

export const getService = (categorySlug: string, serviceSlug: string) =>
  services.find(
    (service) => service.categorySlug === categorySlug && service.slug === serviceSlug
  ) ?? null;

export const getServiceBySlug = (serviceSlug: string) =>
  services.find((service) => service.slug === serviceSlug) ?? null;

export const getMasters = () => masters;

export const getMaster = (slug: string) => masters.find((master) => master.slug === slug) ?? null;

export const getLocations = () => locations;

export const getLocation = (slug: string) =>
  locations.find((location) => location.slug === slug) ?? null;

export const getOffers = () => offers;

export const getReviews = () => reviews;

export const getNews = () => news;

export const getNewsArticle = (slug: string) =>
  news.find((article) => article.slug === slug) ?? null;

export const getGalleryMoments = () => galleryMoments;

export const getJobOpenings = () => jobOpenings;

export const getServicesForMaster = (masterSlug: string) => {
  const master = getMaster(masterSlug);
  return master ? services.filter((service) => master.serviceSlugs.includes(service.slug)) : [];
};

export const getLocationsForMaster = (masterSlug: string) => {
  const master = getMaster(masterSlug);
  return master ? locations.filter((location) => master.locationSlugs.includes(location.slug)) : [];
};

export const getMastersForService = (serviceSlug: string) =>
  masters.filter((master) => master.serviceSlugs.includes(serviceSlug));

export const getLocationsForService = (serviceSlug: string) =>
  locations.filter((location) => location.serviceSlugs.includes(serviceSlug));

export const getMastersForLocation = (locationSlug: string) => {
  const location = getLocation(locationSlug);
  return location ? masters.filter((master) => location.masterSlugs.includes(master.slug)) : [];
};

export const getServicesForLocation = (locationSlug: string) => {
  const location = getLocation(locationSlug);
  return location ? services.filter((service) => location.serviceSlugs.includes(service.slug)) : [];
};
