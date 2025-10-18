import * as z from "zod";
import { TaskStatus } from "@prisma/client";

// Task form validation
export const taskFormSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(1, "Title is required")
    .max(200, "Title too long"),
  description: z
    .string()
    .max(2000, "Description too long")
    .optional(),
  dueDate: z
    .date()
    .optional(),
  assignedTo: z
    .string()
    .min(1)
    .optional(),
  clientId: z
    .string()
    .min(1)
    .optional(),
  propertyId: z
    .string()
    .min(1)
    .optional(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
});

// Schema for updating task
export const updateTaskSchema = taskFormSchema.partial().extend({
  id: z.string().min(1, "Task ID is required"),
});

// Schema for task filters
export const taskFiltersSchema = z.object({
  status: z.nativeEnum(TaskStatus).optional(),
  assignedTo: z.string().optional(),
  clientId: z.string().optional(),
  propertyId: z.string().optional(),
  dueDateFrom: z.date().optional(),
  dueDateTo: z.date().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
export type UpdateTaskData = z.infer<typeof updateTaskSchema>;
export type TaskFilters = z.infer<typeof taskFiltersSchema>;