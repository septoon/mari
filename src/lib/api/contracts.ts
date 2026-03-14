import { z } from 'zod';

const numericLikeSchema = z.union([z.number(), z.string()]).transform((value) => Number(value));

export const apiErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional()
  })
});

export const buildApiOkSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    ok: z.literal(true),
    data: schema,
    meta: z.record(z.string(), z.unknown()).optional()
  });

const phoneSchema = z.object({
  label: z.string(),
  e164: z.string(),
  display: z.string().optional(),
  ext: z.string().optional(),
  primary: z.boolean().optional(),
  whatsapp: z.boolean().optional(),
  telegram: z.boolean().optional(),
  viber: z.boolean().optional()
});

const addressSchema = z.object({
  label: z.string(),
  line1: z.string(),
  line2: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  comment: z.string().optional()
});

const workingHoursSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  open: z.string(),
  close: z.string()
});

export const contactPointSchema = z.object({
  id: z.string(),
  name: z.string(),
  publicName: z.string().optional(),
  legalName: z.string().optional(),
  aliases: z.array(z.string()).optional(),
  addresses: z.array(addressSchema),
  phones: z.array(phoneSchema),
  emails: z.array(z.string()).optional(),
  website: z.string().url().optional(),
  mapUrl: z.string().url().optional(),
  workingHours: z.array(workingHoursSlotSchema).optional(),
  orderIndex: z.number().int(),
  isPrimary: z.boolean(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  note: z.string().optional()
});

const bannerPayloadSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  imageAssetId: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional()
});

const textPayloadSchema = z.object({
  title: z.string().optional(),
  body: z.string()
});

const buttonPayloadSchema = z.object({
  label: z.string(),
  url: z.string().url(),
  style: z.enum(['primary', 'secondary', 'ghost']).default('primary')
});

const buttonsPayloadSchema = z.object({
  title: z.string().optional(),
  items: z.array(buttonPayloadSchema)
});

const faqPayloadSchema = z.object({
  title: z.string().optional(),
  items: z.array(
    z.object({
      question: z.string(),
      answer: z.string()
    })
  )
});

const promoPayloadSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  badge: z.string().optional(),
  imageAssetId: z.string().optional(),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional()
});

const offersPayloadSchema = z.object({
  title: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      imageAssetId: z.string().optional(),
      originalPrice: z.number().optional(),
      finalPrice: z.number().optional(),
      currency: z.string().default('RUB'),
      ctaText: z.string().optional(),
      ctaUrl: z.string().url().optional()
    })
  )
});

const contactsPayloadSchema = z.object({
  title: z.string().optional(),
  items: z.array(contactPointSchema)
});

const blockSharedSchema = z.object({
  id: z.string().uuid(),
  blockKey: z.string(),
  sortOrder: z.number().int(),
  status: z.enum(['draft', 'published']),
  platform: z.enum(['all', 'ios', 'android', 'web']),
  minAppVersion: z.string().nullable(),
  maxAppVersion: z.string().nullable(),
  startAt: z.string().datetime().nullable(),
  endAt: z.string().datetime().nullable(),
  isEnabled: z.boolean(),
  releaseId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const clientContentBlockSchema = z.discriminatedUnion('blockType', [
  blockSharedSchema.extend({
    blockType: z.literal('BANNER'),
    payload: bannerPayloadSchema
  }),
  blockSharedSchema.extend({
    blockType: z.literal('TEXT'),
    payload: textPayloadSchema
  }),
  blockSharedSchema.extend({
    blockType: z.literal('BUTTONS'),
    payload: buttonsPayloadSchema
  }),
  blockSharedSchema.extend({
    blockType: z.literal('FAQ'),
    payload: faqPayloadSchema
  }),
  blockSharedSchema.extend({
    blockType: z.literal('PROMO'),
    payload: promoPayloadSchema
  }),
  blockSharedSchema.extend({
    blockType: z.literal('OFFERS'),
    payload: offersPayloadSchema
  }),
  blockSharedSchema.extend({
    blockType: z.literal('CONTACTS'),
    payload: contactsPayloadSchema
  }),
  blockSharedSchema.extend({
    blockType: z.literal('CUSTOM'),
    payload: z.record(z.string(), z.unknown())
  })
]);

const specialistPhotoVariantSchema = z.object({
  id: z.string().uuid(),
  format: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  path: z.string(),
  urlPath: z.string(),
  url: z.string(),
  size: z.number().int()
});

const specialistPhotoSchema = z.object({
  assetId: z.string().uuid(),
  originalUrlPath: z.string(),
  originalUrl: z.string(),
  preferredUrlPath: z.string().nullable(),
  preferredUrl: z.string(),
  variants: z.array(specialistPhotoVariantSchema)
});

export const serviceSchema = z.object({
  id: z.string().uuid(),
  externalId: z.string().nullable().optional(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string()
  }),
  name: z.string(),
  nameOnline: z.string().nullable(),
  description: z.string().nullable(),
  durationSec: z.number().int().positive(),
  priceMin: z.number().nonnegative(),
  priceMax: z.number().nonnegative().nullable(),
  isActive: z.boolean()
});

const specialistServiceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  durationSec: z.number().int().positive(),
  priceMin: numericLikeSchema,
  priceMax: numericLikeSchema.nullable(),
  category: z.object({
    id: z.string().uuid(),
    name: z.string()
  })
});

export const specialistCardSchema = z.object({
  staffId: z.string().uuid(),
  name: z.string(),
  specialty: z.string().nullable(),
  info: z.string().nullable(),
  ctaText: z.string(),
  isVisible: z.boolean(),
  sortOrder: z.number().int(),
  photoAssetId: z.string().uuid().nullable(),
  photo: specialistPhotoSchema.nullable(),
  services: z.array(specialistServiceSchema),
  isActive: z.boolean(),
  firedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime()
});

const featureFlagRuleSchema = z.object({
  platform: z.enum(['all', 'ios', 'android', 'web']),
  minVersion: z.string().optional(),
  maxVersion: z.string().optional(),
  enabled: z.boolean(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional()
});

const featureFlagSchema = z.object({
  defaultEnabled: z.boolean(),
  rules: z.array(featureFlagRuleSchema)
});

export const clientBootstrapSchema = z.object({
  version: z.number().int().nonnegative(),
  publishedAt: z.string().datetime().nullable(),
  config: z.object({
    brandName: z.string().nullable(),
    legalName: z.string().nullable(),
    minAppVersionIos: z.string().nullable(),
    minAppVersionAndroid: z.string().nullable(),
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().nullable(),
    featureFlags: z.record(z.string(), featureFlagSchema),
    featureFlagState: z.record(z.string(), z.boolean()),
    contacts: z.array(contactPointSchema),
    extra: z.record(z.string(), z.unknown())
  }),
  blocks: z.array(clientContentBlockSchema),
  specialists: z.array(specialistCardSchema)
});

export const serviceListSchema = z.object({
  items: z.array(serviceSchema)
});

export const slotsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceIds: z.array(z.string().uuid()).min(1),
  staffId: z.string().uuid().optional(),
  anyStaff: z.boolean().optional()
});

export const slotsResultSchema = z.object({
  date: z.string(),
  stepMinutes: z.number().int().positive(),
  durationSec: z.number().int().positive(),
  results: z.array(
    z.object({
      staffId: z.string().uuid(),
      staffName: z.string(),
      slots: z.array(
        z.object({
          startAt: z.string().datetime(),
          endAt: z.string().datetime()
        })
      )
    })
  )
});

export const createAppointmentInputSchema = z.object({
  client: z
    .object({
      name: z.string().trim().min(1),
      phone: z.string().trim().min(1)
    })
    .optional(),
  serviceIds: z.array(z.string().uuid()).min(1),
  staffId: z.string().uuid().optional(),
  anyStaff: z.boolean().optional(),
  startAt: z.string().datetime(),
  comment: z.string().trim().max(1000).optional(),
  promoCode: z.string().trim().min(1).optional()
});

const appointmentServiceSchema = z.object({
  serviceId: z.string().uuid(),
  name: z.string(),
  price: z.number().nonnegative(),
  priceWithDiscount: z.number().nonnegative(),
  durationSec: z.number().int().positive()
});

export const appointmentCreatedSchema = z.object({
  appointment: z.object({
    id: z.string().uuid(),
    externalId: z.string(),
    status: z.enum(['PENDING', 'CONFIRMED', 'ARRIVED', 'NO_SHOW', 'CANCELLED']),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    staff: z.object({
      id: z.string().uuid(),
      name: z.string()
    }),
    client: z.object({
      id: z.string().uuid(),
      name: z.string().nullable()
    }),
    services: z.array(appointmentServiceSchema),
    prices: z.object({
      baseTotal: z.number().nonnegative(),
      discountAmount: z.number().nonnegative(),
      finalTotal: z.number().nonnegative()
    }),
    payment: z.object({
      status: z.enum(['UNPAID', 'PARTIAL', 'PAID']),
      method: z.enum(['CASH', 'CARD', 'TRANSFER', 'OTHER']),
      paidAmount: z.number().nonnegative()
    }),
    promo: z
      .object({
        code: z.string(),
        discountType: z.enum(['NONE', 'FIXED', 'PERCENT']),
        discountValue: z.number().nullable(),
        discountAmount: z.number().nonnegative()
      })
      .nullable()
  })
});

const clientDiscountSchema = z.object({
  permanentPercent: z.number().nullable()
});

export const clientProfileSchema = z.object({
  id: z.string().uuid(),
  phoneE164: z.string(),
  name: z.string().nullable(),
  email: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  discount: clientDiscountSchema.default({ permanentPercent: null })
});

export const tokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresInSec: z.number().int().positive()
});

export const authInputSchema = z.object({
  phone: z.string().trim().min(1),
  password: z.string().min(1)
});

export const registerInputSchema = authInputSchema.extend({
  email: z.string().email().optional(),
  name: z.string().trim().min(1).optional()
});

export const authPayloadSchema = z.object({
  client: clientProfileSchema,
  tokens: tokenPairSchema
});

export const logoutInputSchema = z.object({
  refreshToken: z.string().min(1)
});

export const passwordResetRequestInputSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().trim().min(1).optional()
  })
  .refine((value) => Boolean(value.email || value.phone), {
    message: 'email or phone is required'
  });

export const passwordResetRequestResultSchema = z.object({
  sent: z.boolean(),
  resetLink: z.string().url().optional()
});

export const passwordResetConfirmInputSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(8)
});

export const clientAppointmentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10)
});

export const clientAppointmentsSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      status: z.enum(['PENDING', 'CONFIRMED', 'ARRIVED', 'NO_SHOW', 'CANCELLED']),
      startAt: z.string().datetime(),
      endAt: z.string().datetime(),
      staff: z.object({
        id: z.string().uuid(),
        name: z.string()
      }),
      services: z.array(
        z.object({
          name: z.string(),
          durationSec: z.number().int().positive(),
          price: z.number().nonnegative(),
          priceWithDiscount: z.number().nonnegative()
        })
      ),
      prices: z.object({
        baseTotal: z.number().nonnegative(),
        discountAmount: z.number().nonnegative(),
        finalTotal: z.number().nonnegative()
      }),
      payment: z.object({
        status: z.enum(['UNPAID', 'PARTIAL', 'PAID']),
        method: z.enum(['CASH', 'CARD', 'TRANSFER', 'OTHER']),
        paidAmount: z.number().nonnegative()
      }),
      promo: z
        .object({
          code: z.string(),
          discountType: z.enum(['NONE', 'FIXED', 'PERCENT']),
          discountValue: z.number().nullable(),
          discountAmount: z.number().nonnegative()
        })
        .nullable()
    })
  )
});

export const cancelAppointmentInputSchema = z.object({
  reason: z.string().trim().max(500).optional()
});

export const cancelAppointmentResultSchema = z.object({
  appointment: z.object({
    id: z.string().uuid(),
    status: z.enum(['PENDING', 'CONFIRMED', 'ARRIVED', 'NO_SHOW', 'CANCELLED']),
    startAt: z.string().datetime()
  }),
  policy: z
    .object({
      minNoticeMinutes: z.number().int().positive()
    })
    .optional()
});

export const clientSessionSchema = z.object({
  authenticated: z.boolean(),
  client: clientProfileSchema.nullable()
});

export type ClientBootstrap = z.infer<typeof clientBootstrapSchema>;
export type ClientContentBlock = z.infer<typeof clientContentBlockSchema>;
export type ClientAppointmentsResult = z.infer<typeof clientAppointmentsSchema>;
export type ClientProfile = z.infer<typeof clientProfileSchema>;
export type ClientSession = z.infer<typeof clientSessionSchema>;
export type ContactPoint = z.infer<typeof contactPointSchema>;
export type CreatedAppointment = z.infer<typeof appointmentCreatedSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type ServiceList = z.infer<typeof serviceListSchema>;
export type SlotsResult = z.infer<typeof slotsResultSchema>;
export type SpecialistCard = z.infer<typeof specialistCardSchema>;
