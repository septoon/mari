export type FaqItem = {
  question: string;
  answer: string;
};

export type ProcedureStep = {
  title: string;
  text: string;
};

export type ServiceCategory = {
  slug: string;
  name: string;
  shortName: string;
  eyebrow: string;
  description: string;
  heroText: string;
  accent: string;
  serviceSlugs: string[];
};

export type ServiceItem = {
  slug: string;
  categorySlug: string;
  name: string;
  tagline: string;
  excerpt: string;
  description: string;
  suitableFor: string[];
  benefits: string[];
  steps: ProcedureStep[];
  durationMinutes: number;
  priceFrom: number;
  faq: FaqItem[];
  locations: string[];
  masters: string[];
  featured?: boolean;
};

export type MasterProfile = {
  slug: string;
  name: string;
  role: string;
  specialty: string;
  experienceYears: number;
  bio: string;
  quote: string;
  focus: string[];
  achievements: string[];
  serviceSlugs: string[];
  locationSlugs: string[];
  works: Array<{
    title: string;
    description: string;
  }>;
};

export type LocationProfile = {
  slug: string;
  name: string;
  district: string;
  address: string;
  phone: string;
  workingHours: string;
  mapUrl: string;
  description: string;
  note: string;
  serviceSlugs: string[];
  masterSlugs: string[];
  features: string[];
  interiorMoments: Array<{
    title: string;
    description: string;
  }>;
};

export type OfferItem = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  priceNote: string;
  ctaHref: string;
};

export type ReviewItem = {
  name: string;
  role: string;
  text: string;
};

export type NewsArticle = {
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  excerpt: string;
  body: string[];
};

export type GalleryMoment = {
  slug: string;
  title: string;
  note: string;
  label: string;
};

export type JobOpening = {
  slug: string;
  title: string;
  location: string;
  schedule: string;
  description: string;
  requirements: string[];
};
