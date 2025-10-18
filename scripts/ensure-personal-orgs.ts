/**
 * Migration Script: Ensure Personal Organizations
 * 
 * This script ensures that every user has a personal organization.
 * For users without any organization or with only shared orgs,
 * it creates a personal org and assigns the user to it.
 * 
 * Run with: npx tsx scripts/ensure-personal-orgs.ts
 */

import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function ensurePersonalOrgs() {
  console.log("🔍 Checking for users without personal organizations...\n");

  try {
    // Find all users
    const allUsers = await prisma.user.findMany({
      include: {
        organization: true,
      },
    });

    console.log(`📊 Found ${allUsers.length} total users\n`);

    let createdCount = 0;
    let skippedCount = 0;

    for (const user of allUsers) {
      // Check if user has a personal org
      const hasPersonalOrg = user.organization?.isPersonal === true;

      if (hasPersonalOrg) {
        console.log(`✅ User ${user.email} already has a personal org: "${user.organization?.name}"`);
        skippedCount++;
        continue;
      }

      // Create personal org for this user
      const personalOrgName = `${user.name || user.email?.split('@')[0] || 'User'}'s Organization`;
      
      console.log(`🆕 Creating personal org for ${user.email}...`);

      const personalOrg = await prisma.organization.create({
        data: {
          name: personalOrgName,
          isPersonal: true,
          plan: "FREE",
        },
      });

      // If user has no organization, assign them to the personal org as ORG_OWNER
      if (!user.organizationId) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            organizationId: personalOrg.id,
            role: UserRole.ORG_OWNER,
          },
        });
        console.log(`   ✓ Assigned user to personal org as ORG_OWNER`);
      } else {
        // User is already in another org, just create the personal org
        // They can switch to it later
        console.log(`   ✓ Created personal org (user remains in current org)`);
      }

      createdCount++;
      console.log();
    }

    console.log("\n" + "=".repeat(50));
    console.log(`✨ Migration complete!`);
    console.log(`   • Personal orgs created: ${createdCount}`);
    console.log(`   • Users already had personal orgs: ${skippedCount}`);
    console.log("=".repeat(50) + "\n");

  } catch (error) {
    console.error("❌ Error during migration:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
ensurePersonalOrgs()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
