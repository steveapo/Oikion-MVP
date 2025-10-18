import { UserRole } from "@prisma/client";

/**
 * Role hierarchy for authorization checks
 * Higher roles can access features of lower roles
 */
const ROLE_HIERARCHY = {
  [UserRole.ORG_OWNER]: 4,
  [UserRole.ADMIN]: 3,
  [UserRole.AGENT]: 2,
  [UserRole.VIEWER]: 1,
} as const;

/**
 * Check if a user role has sufficient permission level
 * @param userRole - The user's current role
 * @param requiredRole - The minimum required role
 * @returns boolean indicating if user has sufficient permissions
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];
  
  return userLevel >= requiredLevel;
}

/**
 * Check if user can access billing features
 * Only ORG_OWNER can access billing
 */
export function canAccessBilling(role: UserRole): boolean {
  return role === UserRole.ORG_OWNER;
}

/**
 * Check if user can manage organization members
 * ORG_OWNER can do everything, ADMIN can invite/remove but not change billing
 */
export function canManageMembers(role: UserRole): boolean {
  return hasRole(role, UserRole.ADMIN);
}

/**
 * Check if user can create/edit content (properties, clients, etc.)
 * VIEWER role is read-only
 */
export function canCreateContent(role: UserRole): boolean {
  return hasRole(role, UserRole.AGENT);
}

/**
 * Check if user can delete content
 * @param role - User's role
 * @param isOwner - Whether the user created the content
 * @returns boolean indicating if user can delete
 */
export function canDeleteContent(role: UserRole, isOwner: boolean = false): boolean {
  // ORG_OWNER and ADMIN can delete anything
  if (hasRole(role, UserRole.ADMIN)) {
    return true;
  }
  
  // AGENT can only delete their own content
  if (role === UserRole.AGENT && isOwner) {
    return true;
  }
  
  return false;
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(role: UserRole): boolean {
  return hasRole(role, UserRole.ADMIN);
}

/**
 * Get user-friendly role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames = {
    [UserRole.ORG_OWNER]: "Organization Owner",
    [UserRole.ADMIN]: "Administrator",
    [UserRole.AGENT]: "Agent",
    [UserRole.VIEWER]: "Viewer",
  };
  
  return roleNames[role];
}

/**
 * Get all roles that are equal or lower than the given role
 * Useful for role assignment dropdowns
 * @deprecated Use getAssignableRolesByUser instead
 */
export function getAssignableRoles(currentUserRole: UserRole): UserRole[] {
  return getAssignableRolesByUser(currentUserRole);
}

/**
 * Check if user can assign a specific role
 * ORG_OWNER can assign any role
 * ADMIN can only assign AGENT and VIEWER
 */
export function canAssignRole(currentUserRole: UserRole, targetRole: UserRole): boolean {
  // ORG_OWNER can assign any role (for now, later we'll add transfer ownership)
  if (currentUserRole === UserRole.ORG_OWNER) {
    return true;
  }
  
  // ADMIN can only assign AGENT and VIEWER roles
  if (currentUserRole === UserRole.ADMIN) {
    return targetRole === UserRole.AGENT || targetRole === UserRole.VIEWER;
  }
  
  // AGENT and VIEWER cannot assign roles
  return false;
}

/**
 * Check if a user can change another user's role
 * @param currentUserRole - The role of the user making the change
 * @param targetUserId - ID of the user whose role is being changed
 * @param currentUserId - ID of the user making the change
 * @param targetRole - The new role being assigned
 * @returns boolean indicating if the action is allowed
 */
export function canChangeUserRole(
  currentUserRole: UserRole,
  targetUserId: string,
  currentUserId: string,
  targetRole: UserRole
): boolean {
  // Cannot change own role
  if (targetUserId === currentUserId) {
    return false;
  }
  
  // Must have permission to assign the target role
  return canAssignRole(currentUserRole, targetRole);
}

/**
 * Get roles that can be assigned by the current user
 * ORG_OWNER can assign all roles (except when changing their own - use transfer ownership)
 * ADMIN can assign AGENT and VIEWER
 */
export function getAssignableRolesByUser(currentUserRole: UserRole): UserRole[] {
  if (currentUserRole === UserRole.ORG_OWNER) {
    return [UserRole.ORG_OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.VIEWER];
  }
  
  if (currentUserRole === UserRole.ADMIN) {
    return [UserRole.AGENT, UserRole.VIEWER];
  }
  
  return [];
}

/**
 * Default role for new users
 */
export const DEFAULT_USER_ROLE = UserRole.AGENT;

/**
 * Role descriptions for UI display
 */
export const ROLE_DESCRIPTIONS = {
  [UserRole.ORG_OWNER]: "Full access to all features including billing and member management",
  [UserRole.ADMIN]: "Administrative access to all operational features, limited billing access",
  [UserRole.AGENT]: "Full operational access to properties, clients, and activities",
  [UserRole.VIEWER]: "Read-only access to view properties, clients, and activity feed",
} as const;