/**
 * Organization-scoped Prisma client extension for Row-Level Security (RLS)
 * 
 * This module provides a Prisma client extension that automatically sets the
 * `app.current_organization` session variable for all database operations,
 * ensuring RLS policies enforce tenant isolation at the database layer.
 * 
 * Usage:
 *   const db = prismaForOrg(session.user.organizationId);
 *   const properties = await db.property.findMany({ ... });
 * 
 * @see /docs/design/security-multi-tenancy.md for architecture details
 */

import { Prisma, PrismaClient } from "@prisma/client";
import "server-only";

// Cache for organization-scoped clients
const orgClientCache = new Map<string, ReturnType<typeof createOrgPrismaClient>>();

/**
 * Creates a Prisma client extension that sets the organization context
 * for all database operations via PostgreSQL session variables.
 * 
 * The extension wraps all operations in a transaction and executes
 * `set_config('app.current_organization', orgId, TRUE)` before each query.
 * The `TRUE` flag ensures the setting is transaction-scoped and automatically
 * resets after commit, preventing conflicts in connection pooling environments.
 * 
 * @param orgId - The organization ID to scope all queries to
 * @returns Extended Prisma client with organization context
 */
function createOrgPrismaClient(orgId: string) {
  const prisma = new PrismaClient();

  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query, operation, model }) {
          // Wrap the operation in a transaction to set the session variable
          return await prisma.$transaction(async (tx) => {
            // Set the organization context as a transaction-local session variable
            // The TRUE parameter makes it transaction-scoped (resets after COMMIT)
            await (tx as any).$executeRawUnsafe(
              `SELECT set_config('app.current_organization', $1, TRUE)`,
              orgId
            );

            // Execute the original query
            // RLS policies will now enforce organizationId = current_setting('app.current_organization')
            return query(args);
          });
        },
      },
    },
  });
}

/**
 * Get or create a cached Prisma client scoped to a specific organization.
 * 
 * This is the main entry point for server actions that need to enforce
 * organization-level data isolation. Always use this instead of the raw
 * `prisma` client when querying tenant-scoped tables.
 * 
 * @param orgId - The organization ID from the authenticated session
 * @returns Prisma client with organization context applied
 * 
 * @example
 * ```typescript
 * const session = await auth();
 * if (!session?.user?.organizationId) {
 *   throw new Error("Unauthorized");
 * }
 * 
 * const db = prismaForOrg(session.user.organizationId);
 * const properties = await db.property.findMany({ ... });
 * ```
 */
export function prismaForOrg(orgId: string) {
  if (!orgId) {
    throw new Error("Organization ID is required for database operations");
  }

  // Return cached client if it exists
  if (orgClientCache.has(orgId)) {
    return orgClientCache.get(orgId)!;
  }

  // Create and cache new client
  const client = createOrgPrismaClient(orgId);
  orgClientCache.set(orgId, client);

  return client;
}

/**
 * Clear the organization client cache.
 * Useful for testing or when connection pool needs to be refreshed.
 */
export function clearOrgClientCache() {
  orgClientCache.clear();
}
