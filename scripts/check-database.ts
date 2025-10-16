import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking database for users and organizations...\n");

  // Get all users
  const users = await prisma.user.findMany({
    include: {
      organization: true,
    },
  });

  console.log(`Total users in database: ${users.length}\n`);

  if (users.length === 0) {
    console.log("❌ No users found in database. Please sign up first.");
    return;
  }

  for (const user of users) {
    console.log(`User: ${user.email || user.id}`);
    console.log(`  Name: ${user.name || "N/A"}`);
    console.log(`  Role: ${user.role}`);
    console.log(`  Organization ID: ${user.organizationId || "❌ MISSING"}`);
    console.log(`  Organization Name: ${user.organization?.name || "N/A"}`);
    console.log("");
  }

  // Get all organizations
  const organizations = await prisma.organization.findMany({
    include: {
      _count: {
        select: {
          users: true,
          properties: true,
          clients: true,
        },
      },
    },
  });

  console.log(`\nTotal organizations in database: ${organizations.length}\n`);

  for (const org of organizations) {
    console.log(`Organization: ${org.name} (${org.id})`);
    console.log(`  Users: ${org._count.users}`);
    console.log(`  Properties: ${org._count.properties}`);
    console.log(`  Clients: ${org._count.clients}`);
    console.log("");
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
