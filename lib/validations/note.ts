import * as z from "zod";

// Base note schema without refinements
const baseNoteSchema = z.object({
  content: z
    .string({ required_error: "Note content is required" })
    .min(1, "Note content is required")
    .max(5000, "Note too long"),
  clientId: z
    .string()
    .min(1)
    .optional(),
  propertyId: z
    .string()
    .min(1)
    .optional(),
});

// Note form validation with refinement
export const noteFormSchema = baseNoteSchema.refine(
  (data) => data.clientId || data.propertyId,
  {
    message: "Note must be associated with either a client or property",
    path: ["clientId"],
  }
);

// Schema for updating note (partial without refinement, then add id)
export const updateNoteSchema = baseNoteSchema.partial().extend({
  id: z.string().min(1, "Note ID is required"),
});

// Schema for note filters
export const noteFiltersSchema = z.object({
  clientId: z.string().optional(),
  propertyId: z.string().optional(),
  search: z.string().max(200).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type NoteFormData = z.infer<typeof noteFormSchema>;
export type UpdateNoteData = z.infer<typeof updateNoteSchema>;
export type NoteFilters = z.infer<typeof noteFiltersSchema>;