import { z } from "zod";

export const listingSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters").max(120),
    description: z.string().default(""),
    type: z.enum(["SELL_HOME", "SELL_LAND", "RENT", "LEASE"]),
    category: z.enum([
      "villa",
      "apartment",
      "house",
      "plot",
      "commercial",
      "agricultural",
    ]),
    status: z
      .enum(["draft", "published", "sold", "archived"])
      .default("draft"),

    isFeatured: z.boolean().default(false),
    feature: z
      .object({
        paidBy: z.string().optional(),
        amount: z.coerce.number().optional(),
        paidOn: z.string().optional(),
        featureUntil: z.string().optional(),
      })
      .optional(),

    district: z.string().min(1, "District is required"),
    taluk: z.string().min(1, "Taluk is required"),
    village: z.string().min(1, "Village/area is required"),
    locality: z.string().optional(),
    address: z.string().optional(),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),

    areaValue: z.coerce.number().positive("Area must be positive"),
    areaUnit: z.enum(["cent", "acre", "sqft"]),
    bedrooms: z.coerce.number().min(0).optional(),
    bathrooms: z.coerce.number().min(0).optional(),
    furnishing: z.string().optional(),
    facing: z.string().optional(),
    floors: z.coerce.number().min(0).optional(),
    ageYears: z.coerce.number().min(0).optional(),

    askingPrice: z.coerce.number().positive("Price must be positive"),
    fairValueRef: z.coerce.number().optional(),
    isNegotiable: z.boolean().default(false),
    monthlyRent: z.coerce.number().optional(),
    deposit: z.coerce.number().optional(),
    leaseTermMonths: z.coerce.number().optional(),

    coverIndex: z.coerce.number().default(0),
    youtubeUrl: z
      .string()
      .optional()
      .refine(
        (v) =>
          !v ||
          /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/.test(
            v
          ),
        { message: "Must be a valid YouTube URL" }
      ),

    highlights: z.array(z.string()).default([]),
  });

// Use input type so fields with .default() remain optional in the form
export type ListingFormData = z.input<typeof listingSchema>;

export const leadSchema = z.object({
  listingId: z.string().optional(),
  listingTitleSnapshot: z.string(),
  name: z.string().min(2, "Name is required"),
  phone: z
    .string()
    .min(10, "Enter a valid phone number")
    .regex(/^[+\d\s-]{10,15}$/, "Enter a valid phone number"),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().optional(),
  source: z.string().optional(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    })
    .optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
