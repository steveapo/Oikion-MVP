/**
 * Centralized Authentication Utilities
 * 
 * This module provides reusable authentication and authorization utilities
 * for server actions to reduce boilerplate and ensure consistent security checks.
 */

import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { 
  createErrorResponse, 
  ErrorCode,
  type ActionResponse 
} from "./action-response";

/**
 * Authenticated user session with required fields
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  organizationId: string;
}

/**
 * Authentication check result
 */
export type AuthCheckResult = 
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: ActionResponse<never> };

/**
 * Require user to be authenticated
 * 
 * Checks for valid session and ensures user has an organization.
 * Returns standardized error response if authentication fails.
 * 
 * @returns Authenticated user data or error response
 * 
 * @example
 * ```ts
 * export async function myAction() {
 *   const authResult = await requireAuth();
 *   if (!authResult.success) return authResult.error;
 *   
 *   const { user } = authResult;
 *   // Use user.id, user.organizationId, etc.
 * }
 * ```
 */
export async function requireAuth(): Promise<AuthCheckResult> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return {
      success: false,
      error: createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Your session has expired. Please sign in again."
      ),
    };
  }

  if (!session.user.email) {
    return {
      success: false,
      error: createErrorResponse(
        ErrorCode.UNAUTHORIZED,
        "Invalid session data. Please sign in again."
      ),
    };
  }

  if (!session.user.organizationId) {
    return {
      success: false,
      error: createErrorResponse(
        ErrorCode.FORBIDDEN,
        "You must belong to an organization to perform this action."
      ),
    };
  }

  return {
    success: true,
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name || null,
      role: session.user.role,
      organizationId: session.user.organizationId,
    },
  };
}

/**
 * Permission check options
 */
export interface PermissionCheckOptions {
  /** Minimum role required */
  minRole?: UserRole;
  
  /** Specific roles allowed (any one matches) */
  allowedRoles?: UserRole[];
  
  /** Whether the user must be the resource owner */
  requireOwnership?: boolean;
  
  /** ID of the user who owns the resource (for ownership check) */
  ownerId?: string;
}

/**
 * Check if user has required permissions
 * 
 * @param user - Authenticated user
 * @param options - Permission requirements
 * @returns Error response if check fails, null if passes
 * 
 * @example
 * ```ts
 * const permissionError = checkPermissions(user, {
 *   allowedRoles: [UserRole.ORG_OWNER, UserRole.ADMIN],
 * });
 * if (permissionError) return permissionError;
 * ```
 */
export function checkPermissions(
  user: AuthenticatedUser,
  options: PermissionCheckOptions
): ActionResponse<never> | null {
  // Check allowed roles
  if (options.allowedRoles && options.allowedRoles.length > 0) {
    if (!options.allowedRoles.includes(user.role)) {
      return createErrorResponse(
        ErrorCode.INSUFFICIENT_PERMISSIONS,
        "You don't have permission to perform this action."
      );
    }
  }

  // Check minimum role (hierarchy: ORG_OWNER > ADMIN > AGENT > VIEWER)
  if (options.minRole) {
    const roleHierarchy: Record<UserRole, number> = {
      [UserRole.ORG_OWNER]: 4,
      [UserRole.ADMIN]: 3,
      [UserRole.AGENT]: 2,
      [UserRole.VIEWER]: 1,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[options.minRole] || 0;

    if (userLevel < requiredLevel) {
      return createErrorResponse(
        ErrorCode.INSUFFICIENT_PERMISSIONS,
        "You don't have permission to perform this action."
      );
    }
  }

  // Check ownership
  if (options.requireOwnership && options.ownerId) {
    if (user.id !== options.ownerId) {
      // ORG_OWNER and ADMIN can override ownership
      if (user.role !== UserRole.ORG_OWNER && user.role !== UserRole.ADMIN) {
        return createErrorResponse(
          ErrorCode.INSUFFICIENT_PERMISSIONS,
          "You can only modify resources you created."
        );
      }
    }
  }

  return null;
}

/**
 * Combined authentication and permission check
 * 
 * @param options - Permission requirements
 * @returns Authenticated user or error response
 * 
 * @example
 * ```ts
 * export async function deleteProperty(id: string) {
 *   const authResult = await requireAuthWithPermissions({
 *     allowedRoles: [UserRole.ORG_OWNER, UserRole.ADMIN, UserRole.AGENT],
 *   });
 *   if (!authResult.success) return authResult.error;
 *   
 *   const { user } = authResult;
 *   // Proceed with deletion
 * }
 * ```
 */
export async function requireAuthWithPermissions(
  options?: PermissionCheckOptions
): Promise<AuthCheckResult> {
  const authResult = await requireAuth();
  if (!authResult.success) return authResult;

  if (options) {
    const permissionError = checkPermissions(authResult.user, options);
    if (permissionError) {
      return {
        success: false,
        error: permissionError,
      };
    }
  }

  return authResult;
}

/**
 * Check if user can create content (properties, clients, etc.)
 */
export function canCreate(role: UserRole): boolean {
  return [UserRole.ORG_OWNER, UserRole.ADMIN, UserRole.AGENT].includes(role);
}

/**
 * Check if user can update content
 */
export function canUpdate(role: UserRole, isOwner: boolean = false): boolean {
  if ([UserRole.ORG_OWNER, UserRole.ADMIN].includes(role)) return true;
  if (role === UserRole.AGENT && isOwner) return true;
  return false;
}

/**
 * Check if user can delete content
 */
export function canDelete(role: UserRole, isOwner: boolean = false): boolean {
  if ([UserRole.ORG_OWNER, UserRole.ADMIN].includes(role)) return true;
  if (role === UserRole.AGENT && isOwner) return true;
  return false;
}

/**
 * Check if user can manage members (invite, change roles, remove)
 */
export function canManageMembers(role: UserRole): boolean {
  return [UserRole.ORG_OWNER, UserRole.ADMIN].includes(role);
}

/**
 * Check if user can manage billing
 */
export function canManageBilling(role: UserRole): boolean {
  return role === UserRole.ORG_OWNER;
}

/**
 * Check if user can view analytics
 */
export function canViewAnalytics(role: UserRole): boolean {
  return [UserRole.ORG_OWNER, UserRole.ADMIN].includes(role);
}
