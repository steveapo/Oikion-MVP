import * as z from "zod";
import { UserRole } from "@prisma/client";

// Organization form validation
export const organizationFormSchema = z.object({
  name: z
    .string({ required_error: "Organization name is required" })
    .min(1, "Organization name is required")
    .max(200, "Organization name too long"),
});

// Organization member invitation schema
export const inviteMemberSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format"),
  role: z.nativeEnum(UserRole, {
    required_error: "Role is required",
  }),
});

// Member role update schema
export const updateMemberRoleSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  role: z.nativeEnum(UserRole, {
    required_error: "Role is required",
  }),
});

// Organization settings schema
export const organizationSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(200, "Organization name too long"),
  // Future: add more organization settings
});

export type OrganizationFormData = z.infer<typeof organizationFormSchema>;
export type InviteMemberData = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleData = z.infer<typeof updateMemberRoleSchema>;
export type OrganizationSettingsData = z.infer<typeof organizationSettingsSchema>;