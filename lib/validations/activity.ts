import * as z from "zod";
import { ActionType, EntityType } from "@prisma/client";

// Activity filters for Oikosync page
export const activityFiltersSchema = z.object({
  actorId: z.string().optional(),
  entityType: z.nativeEnum(EntityType).optional(),
  actionType: z.nativeEnum(ActionType).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional().default(new Date()),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(30),
})
.refine(
  (data) => {
    // If dateTo is provided, dateFrom should not be after it
    if (data.dateFrom && data.dateTo) {
      return data.dateFrom <= data.dateTo;
    }
    return true;
  },
  {
    message: "From date cannot be after to date",
    path: ["dateFrom"],
  }
);

// Activity creation schema (for manual activity creation if needed)
export const createActivitySchema = z.object({
  actionType: z.nativeEnum(ActionType),
  entityType: z.nativeEnum(EntityType),
  entityId: z.string().min(1, "Entity ID is required"),
  payload: z.record(z.any()).optional(),
});

export type ActivityFilters = z.infer<typeof activityFiltersSchema>;
export type CreateActivityData = z.infer<typeof createActivitySchema>;