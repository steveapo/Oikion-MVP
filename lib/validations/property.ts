import * as z from "zod";
import { PropertyType, PropertyStatus, TransactionType, MarketingStatus } from "@prisma/client";

// Base property validation
export const propertyFormSchema = z.object({
  // Required fields
  propertyType: z.nativeEnum(PropertyType, {
    required_error: "Property type is required",
  }),
  status: z.nativeEnum(PropertyStatus, {
    required_error: "Property status is required",
  }),
  transactionType: z.nativeEnum(TransactionType, {
    required_error: "Transaction type is required",
  }),
  price: z
    .number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be positive")
    .max(999999999.99, "Price too large"),

  // Optional property details
  bedrooms: z
    .number()
    .int()
    .min(0, "Bedrooms cannot be negative")
    .max(50, "Too many bedrooms")
    .optional(),
  bathrooms: z
    .number()
    .int()
    .min(0, "Bathrooms cannot be negative")
    .max(20, "Too many bathrooms")
    .optional(),
  size: z
    .number()
    .positive("Size must be positive")
    .max(999999.99, "Size too large")
    .optional(),
  yearBuilt: z
    .number()
    .int()
    .min(1800, "Year built too old")
    .max(new Date().getFullYear() + 5, "Year built cannot be in distant future")
    .optional(),

  // Features and description
  features: z
    .array(z.string().min(1).max(50))
    .max(20, "Too many features")
    .optional(),
  description: z
    .string()
    .max(5000, "Description too long")
    .optional(),

  // Address information
  country: z.string().min(1).max(100).default("Greece"),
  region: z.string().max(100).optional(),
  city: z
    .string({
      required_error: "City is required",
    })
    .min(1, "City is required")
    .max(100, "City name too long"),
  street: z.string().max(200, "Street name too long").optional(),
  number: z.string().max(20, "Street number too long").optional(),
  postalCode: z.string().max(20, "Postal code too long").optional(),
  locationText: z
    .string()
    .max(500, "Location description too long")
    .optional(),

  // Listing information
  marketingStatus: z.nativeEnum(MarketingStatus).default(MarketingStatus.DRAFT),
  listPrice: z
    .number({
      required_error: "List price is required",
    })
    .positive("List price must be positive")
    .max(999999999.99, "List price too large"),
  listingNotes: z
    .string()
    .max(1000, "Listing notes too long")
    .optional(),
});

// Schema for updating property (allows partial updates)
export const updatePropertySchema = propertyFormSchema.partial().extend({
  id: z.string().min(1, "Property ID is required"),
});

// Schema for property filters
export const propertyFiltersSchema = z.object({
  status: z.nativeEnum(PropertyStatus).optional(),
  transactionType: z.nativeEnum(TransactionType).optional(),
  propertyType: z.nativeEnum(PropertyType).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  location: z.string().max(200).optional(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

// Media asset upload schema
export const mediaAssetSchema = z.object({
  propertyId: z.string().min(1, "Property ID is required"),
  files: z
    .array(
      z.object({
        url: z.string().url("Invalid file URL"),
        type: z.enum(["IMAGE", "VIDEO"]),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, "At least one file is required")
    .max(20, "Too many files"),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;
export type UpdatePropertyData = z.infer<typeof updatePropertySchema>;
export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;
export type MediaAssetData = z.infer<typeof mediaAssetSchema>;