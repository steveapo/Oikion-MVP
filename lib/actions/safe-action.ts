import { auth } from "@/auth";
import { prismaForOrg } from "@/lib/org-prisma";
import { UserRole } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { z, ZodSchema } from "zod";

/**
 * Error codes for client-side error handling
 */
export const ActionErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  ORG_REQUIRED: "ORG_REQUIRED",
} as const;

export type ActionErrorCode = typeof ActionErrorCode[keyof typeof ActionErrorCode];

/**
 * Success response structure
 */
export type ActionSuccessResult<T> = {
  success: true;
  data: T;
};

/**
 * Error response structure
 */
export type ActionErrorResult = {
  success: false;
  error: string;
  code: ActionErrorCode;
  fieldErrors?: Record<string, string[]>;
};

/**
 * Combined result type
 */
export type ActionResult<T> = ActionSuccessResult<T> | ActionErrorResult;

/**
 * Context available to action handlers
 */
export type ActionContext = {
  userId: string;
  organizationId: string;
  userRole: UserRole;
  db: PrismaClient;
};

/**
 * Role check function type
 */
export type RoleCheckFn = (role: UserRole, context: ActionContext) => boolean;

/**
 * Action handler function type
 */
export type ActionHandler<TInput, TOutput> = (
  data: TInput,
  context: ActionContext
) => Promise<TOutput>;

/**
 * Configuration for safe action
 */
export type SafeActionConfig<TInput, TOutput> = {
  schema: ZodSchema<TInput>;
  roleCheck?: RoleCheckFn;
  handler: ActionHandler<TInput, TOutput>;
};

/**
 * Input validation constraints for numeric fields
 */
export const NumericConstraints = {
  price: { min: 0, max: 100_000_000 },
  listPrice: { min: 0, max: 100_000_000 },
  size: { min: 0, max: 10_000 },
  bedrooms: { min: 0, max: 50 },
  bathrooms: { min: 0, max: 50 },
  yearBuilt: { min: 1800, max: new Date().getFullYear() + 5 },
} as const;

/**
 * Input validation constraints for string fields
 */
export const StringConstraints = {
  name: { min: 1, max: 200 },
  email: { min: 5, max: 254 },
  phone: { min: 5, max: 20 },
  description: { min: 0, max: 5000 },
  notes: { min: 0, max: 5000 },
  locationText: { min: 0, max: 500 },
} as const;

/**
 * Input validation constraints for array fields
 */
export const ArrayConstraints = {
  features: { min: 0, max: 50, itemMax: 100 },
  tags: { min: 0, max: 20, itemMax: 50 },
} as const;

/**
 * Standardized server action wrapper that handles:
 * - Session verification
 * - Organization membership validation
 * - Input validation with Zod
 * - Role-based authorization
 * - Consistent error responses
 * - Database client with org context
 *
 * @param config - Configuration object with schema, roleCheck, and handler
 * @returns Safe action function that can be called from client components
 *
 * @example
 * ```ts
 * export const createPropertyAction = safeAction({
 *   schema: propertyFormSchema,
 *   roleCheck: (role) => canCreateContent(role),
 *   handler: async (data, { userId, organizationId, db }) => {
 *     const property = await db.property.create({
 *       data: { ...data, organizationId, createdBy: userId }
 *     });
 *     return { propertyId: property.id };
 *   }
 * });
 * ```
 */
export function safeAction<TInput, TOutput>({
  schema,
  roleCheck,
  handler,
}: SafeActionConfig<TInput, TOutput>) {
  return async (input: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Session verification
      const session = await auth();
      
      if (!session?.user?.id) {
        return {
          success: false,
          error: "You must be logged in to perform this action",
          code: ActionErrorCode.UNAUTHORIZED,
        };
      }

      // 2. Organization membership validation
      if (!session.user.organizationId) {
        return {
          success: false,
          error: "You must belong to an organization to perform this action",
          code: ActionErrorCode.ORG_REQUIRED,
        };
      }

      // 3. Input validation with Zod
      const validationResult = schema.safeParse(input);
      
      if (!validationResult.success) {
        const fieldErrors: Record<string, string[]> = {};
        validationResult.error.errors.forEach((err) => {
          const path = err.path.join(".");
          if (!fieldErrors[path]) {
            fieldErrors[path] = [];
          }
          fieldErrors[path].push(err.message);
        });

        return {
          success: false,
          error: "Validation failed",
          code: ActionErrorCode.VALIDATION_ERROR,
          fieldErrors,
        };
      }

      // 4. Create action context
      const context: ActionContext = {
        userId: session.user.id,
        organizationId: session.user.organizationId,
        userRole: session.user.role as UserRole,
        db: prismaForOrg(session.user.organizationId),
      };

      // 5. Role-based authorization check
      if (roleCheck && !roleCheck(context.userRole, context)) {
        return {
          success: false,
          error: "You do not have permission to perform this action",
          code: ActionErrorCode.FORBIDDEN,
        };
      }

      // 6. Execute handler with validated data and context
      const result = await handler(validationResult.data, context);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error("Safe action error:", error);
      
      // Handle known error types
      if (error instanceof Error) {
        if (error.message.includes("not found") || error.message.includes("access denied")) {
          return {
            success: false,
            error: error.message,
            code: ActionErrorCode.NOT_FOUND,
          };
        }
        
        if (error.message.includes("permission") || error.message.includes("Insufficient")) {
          return {
            success: false,
            error: error.message,
            code: ActionErrorCode.FORBIDDEN,
          };
        }
      }

      // Default error response
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
        code: ActionErrorCode.INTERNAL_ERROR,
      };
    }
  };
}

/**
 * Helper to create success result
 */
export function successResult<T>(data: T): ActionSuccessResult<T> {
  return { success: true, data };
}

/**
 * Helper to create error result
 */
export function errorResult(
  error: string,
  code: ActionErrorCode = ActionErrorCode.INTERNAL_ERROR,
  fieldErrors?: Record<string, string[]>
): ActionErrorResult {
  return { success: false, error, code, fieldErrors };
}
