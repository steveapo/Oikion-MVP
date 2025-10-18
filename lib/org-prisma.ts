import { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "./db";

// Returns an org-scoped Prisma client that sets the session variable
// app.current_organization inside a transaction before executing any query.
// This enables PostgreSQL RLS policies to enforce tenant isolation.
export function prismaForOrg(orgId: string): PrismaClient {
  const extension = Prisma.defineExtension((client) =>
    client.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query }) {
            const [, result] = await client.$transaction([
              client.$executeRaw`SELECT set_config('app.current_organization', ${orgId}::text, TRUE)`,
              query(args),
            ]);
            return result as any;
          },
        },
      },
    })
  );

  return (prisma as any).$extends(extension) as PrismaClient;
}

/**
 * Execute multiple Prisma queries within a single organizational context transaction.
 * This reduces transaction overhead by setting app.current_organization once
 * and allowing multiple queries to run within the same context.
 *
 * @param orgId - Organization ID for tenant isolation
 * @param fn - Callback that receives a transaction client and executes multiple queries
 * @returns Promise resolving to the callback's return value
 *
 * @example
 * ```ts
 * const result = await withOrgContext(organizationId, async (tx) => {
 *   const property = await tx.property.create({ data: propertyData });
 *   const address = await tx.address.create({ data: addressData });
 *   const listing = await tx.listing.create({ data: listingData });
 *   return { property, address, listing };
 * });
 * ```
 */
export async function withOrgContext<T>(
  orgId: string,
  fn: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
): Promise<T> {
  if (!orgId || typeof orgId !== "string") {
    throw new Error("Invalid organization ID provided to withOrgContext");
  }

  return await prisma.$transaction(async (tx) => {
    // Set the organization context once for all queries in this transaction
    await tx.$executeRaw`SELECT set_config('app.current_organization', ${orgId}::text, TRUE)`;
    
    // Execute the callback with the transaction client
    return await fn(tx);
  });
}
