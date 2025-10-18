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
