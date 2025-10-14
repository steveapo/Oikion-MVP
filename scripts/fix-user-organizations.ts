import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for users without organizations...");

  // Find all users without an organization
  const usersWithoutOrg = await prisma.user.findMany({
    where: {
      organizationId: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log(`Found ${usersWithoutOrg.length} users without organizations.`);

  for (const user of usersWithoutOrg) {
    console.log(`\nProcessing user: ${user.email || user.id}`);

    // Create organization for user
    const organization = await prisma.organization.create({
      data: {
        name: `${user.name || user.email}'s Organization`,
      },
    });

    console.log(`  ✓ Created organization: ${organization.name}`);

    // Update user with organizationId and set role to ORG_OWNER if not already set
    await prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: organization.id,
        role: user.role === UserRole.AGENT ? UserRole.ORG_OWNER : user.role,
      },
    });

    console.log(`  ✓ Updated user with organization and role`);
  }

  console.log(`\n✅ Successfully processed ${usersWithoutOrg.length} users.`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
