import * as z from "zod";
import { InteractionType } from "@prisma/client";

// Interaction form validation
export const interactionFormSchema = z.object({
  interactionType: z.nativeEnum(InteractionType, {
    required_error: "Interaction type is required",
  }),
  clientId: z
    .string()
    .min(1, "Client is required")
    .optional(),
  propertyId: z
    .string()
    .min(1)
    .optional(),
  summary: z
    .string({ required_error: "Summary is required" })
    .min(1, "Summary is required")
    .max(2000, "Summary too long"),
  timestamp: z
    .date({ required_error: "Timestamp is required" })
    .max(new Date(), "Timestamp cannot be in the future"),
})
.refine(
  (data) => data.clientId || data.propertyId,
  {
    message: "Either client or property must be selected",
    path: ["clientId"],
  }
);

// Schema for updating interaction
export const updateInteractionSchema = interactionFormSchema.partial().extend({
  id: z.string().min(1, "Interaction ID is required"),
});

// Schema for interaction filters
export const interactionFiltersSchema = z.object({
  interactionType: z.nativeEnum(InteractionType).optional(),
  clientId: z.string().optional(),
  propertyId: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(30),
});

export type InteractionFormData = z.infer<typeof interactionFormSchema>;
export type UpdateInteractionData = z.infer<typeof updateInteractionSchema>;
export type InteractionFilters = z.infer<typeof interactionFiltersSchema>;