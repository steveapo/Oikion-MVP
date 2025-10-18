import * as z from "zod";

/**
 * Search parameter validation schema
 * 
 * Validates search input for the CMD+K search command
 * to ensure safe and performant queries.
 */
export const searchParamsSchema = z.object({
  /** Search query string (2-200 characters) */
  q: z
    .string({ required_error: "Search query is required" })
    .min(2, "Query too short - minimum 2 characters")
    .max(200, "Query too long - maximum 200 characters"),
  
  /** Maximum number of results to return (1-50) */
  limit: z
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(10),
  
  /** Entity types to include in search */
  include: z
    .object({
      properties: z.boolean().default(true),
      clients: z.boolean().default(true),
    })
    .optional()
    .default({ properties: true, clients: true }),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
