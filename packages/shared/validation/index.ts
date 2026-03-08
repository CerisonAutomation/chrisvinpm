import { z } from 'zod';

export const EntityIdSchema = z.string();
export const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const SearchParamsSchema = z.object({
  city: z.string().optional(),
  checkIn: ISODateSchema.optional(),
  checkOut: ISODateSchema.optional(),
  guests: z.coerce.number().min(1).default(1),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  amenities: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),
  sort: z.string().optional(),
});

export const QuoteCreateSchema = z.object({
  listingId: EntityIdSchema,
  checkIn: ISODateSchema,
  checkOut: ISODateSchema,
  guests: z.number().min(1),
  couponCode: z.string().optional(),
});

export const InstantChargeSchema = z.object({
  quoteId: EntityIdSchema,
  paymentMethodId: z.string(),
  guest: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(5),
  }),
});

// CMS Schemas
export const PageStatusSchema = z.enum(['draft', 'published', 'archived']);

export const SeoMetaSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).optional(),
  ogImage: z.string().optional(),
  noIndex: z.boolean().default(false),
});

export const SectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  order: z.number(),
  data: z.any(),
});

export const PageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  locale: z.string().default('en'),
  status: PageStatusSchema,
  seo: SeoMetaSchema,
  sections: z.array(SectionSchema),
});
