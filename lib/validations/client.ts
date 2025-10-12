import * as z from "zod";
import { ClientType } from "@prisma/client";

// Client form validation
export const clientFormSchema = z.object({
  clientType: z.nativeEnum(ClientType, {
    required_error: "Client type is required",
  }),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(200, "Name too long"),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .max(50, "Phone number too long")
    .optional(),
  secondaryEmail: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal("")),
  secondaryPhone: z
    .string()
    .max(50, "Phone number too long")
    .optional(),
  tags: z
    .array(
      z.string()
        .min(1, "Tag cannot be empty")
        .max(50, "Tag too long")
    )
    .max(20, "Too many tags")
    .optional(),
})
.refine(
  (data) => data.email || data.phone,
  {
    message: "At least one contact method (email or phone) is required",
    path: ["email"],
  }
);

// Schema for updating client
export const updateClientSchema = clientFormSchema.partial().extend({
  id: z.string().min(1, "Client ID is required"),
});

// Schema for client filters/search
export const clientFiltersSchema = z.object({
  clientType: z.nativeEnum(ClientType).optional(),
  search: z.string().max(200).optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
});

export type ClientFormData = z.infer<typeof clientFormSchema>;
export type UpdateClientData = z.infer<typeof updateClientSchema>;
export type ClientFilters = z.infer<typeof clientFiltersSchema>;