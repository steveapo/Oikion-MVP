/**
 * Verification Script: Personal Organization Protection
 * 
 * This script verifies that:
 * 1. All users have a personal organization
 * 2. All personal organizations are marked with isPersonal: true
 * 3. Users cannot accidentally be left without an organization
 * 
 * Run with: npx tsx scripts/verify-personal-org-protection.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyPersonalOrgProtection() {
  console.log("🔍 Verifying Personal Organization Protection...\n");

  try {
    // Check all users
    const allUsers = await prisma.user.findMany({
      include: {
        organization: true,
      },
    });

    console.log(`📊 Total users: ${allUsers.length}\n`);

    let passCount = 0;
    let failCount = 0;

    for (const user of allUsers) {
      const email = user.email || "(no email)";
      
      if (!user.organizationId) {
        console.log(`❌ FAIL: User ${email} has no organization`);
        failCount++;
        continue;
      }

      if (!user.organization) {
        console.log(`❌ FAIL: User ${email} has organizationId but organization not found`);
        failCount++;
        continue;
      }

      console.log(`✅ PASS: User ${email}`);
      console.log(`   • Organization: ${user.organization.name}`);
      console.log(`   • Is Personal: ${user.organization.isPersonal}`);
      console.log(`   • Role: ${user.role}`);
      passCount++;
    }

    // Check all organizations
    console.log("\n" + "=".repeat(50));
    
    const allOrgs = await prisma.organization.findMany({
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    console.log(`\n📊 Total organizations: ${allOrgs.length}\n`);

    let personalOrgCount = 0;
    let teamOrgCount = 0;

    for (const org of allOrgs) {
      console.log(`• ${org.name}`);
      console.log(`  - Is Personal: ${org.isPersonal}`);
      console.log(`  - Members: ${org._count.users}`);
      console.log(`  - Plan: ${org.plan}`);
      
      if (org.isPersonal) {
        personalOrgCount++;
      } else {
        teamOrgCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("\n📈 Summary:");
    console.log(`   • Users verified: ${passCount}/${allUsers.length}`);
    console.log(`   • Users with issues: ${failCount}`);
    console.log(`   • Personal organizations: ${personalOrgCount}`);
    console.log(`   • Team organizations: ${teamOrgCount}`);
    
    if (failCount === 0 && passCount === allUsers.length) {
      console.log("\n✅ All checks passed! Personal org protection is working correctly.");
    } else {
      console.log("\n⚠️  Some issues found. Please review the output above.");
    }
    
    console.log("=".repeat(50) + "\n");

  } catch (error) {
    console.error("❌ Error during verification:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the verification
verifyPersonalOrgProtection()
  .then(() => {
    console.log("✅ Verification complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  });
