#!/usr/bin/env node

/**
 * Fix Users Stuck in Deleted Organizations
 * 
 * This script finds all users whose organizationId points to a non-existent organization
 * and automatically switches them to their Personal workspace.
 * 
 * Safety Features:
 * - Finds user's existing Personal workspace
 * - Creates Personal workspace if none exists (emergency recovery)
 * - Updates user's organizationId and role
 * - Logs all fixes for audit trail
 * 
 * Usage:
 *   node scripts/fix-deleted-org-users.mjs
 * 
 * Dry Run (preview without changes):
 *   DRY_RUN=true node scripts/fix-deleted-org-users.mjs
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const DRY_RUN = process.env.DRY_RUN === 'true';

async function main() {
  console.log('🔍 Finding users stuck in deleted organizations...\n');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  }

  try {
    // Get all users with an organizationId
    const usersWithOrgs = await prisma.user.findMany({
      where: {
        organizationId: { not: null },
      },
      select: {
        id: true,
        email: true,
        name: true,
        organizationId: true,
        role: true,
      },
    });

    console.log(`📊 Found ${usersWithOrgs.length} users with organization assignments\n`);

    let fixedCount = 0;
    let errorCount = 0;
    const fixes = [];

    for (const user of usersWithOrgs) {
      // Check if the organization exists
      const orgExists = await prisma.organization.findUnique({
        where: { id: user.organizationId },
        select: { id: true, name: true, isPersonal: true },
      });

      if (!orgExists) {
        console.log(`❌ User stuck in deleted org: ${user.email || user.name || user.id}`);
        console.log(`   Deleted Org ID: ${user.organizationId}`);

        // Find user's Personal workspace
        const personalWorkspace = await prisma.organizationMember.findFirst({
          where: {
            userId: user.id,
            organization: {
              isPersonal: true,
            },
          },
          include: {
            organization: true,
          },
        });

        if (personalWorkspace) {
          console.log(`   ✅ Found Personal workspace: ${personalWorkspace.organization.name}`);
          
          if (!DRY_RUN) {
            // Switch user to Personal workspace
            await prisma.user.update({
              where: { id: user.id },
              data: {
                organizationId: personalWorkspace.organization.id,
                role: personalWorkspace.role,
              },
            });

            fixes.push({
              userId: user.id,
              email: user.email,
              oldOrgId: user.organizationId,
              newOrgId: personalWorkspace.organization.id,
              newOrgName: personalWorkspace.organization.name,
            });

            console.log(`   🔄 Switched to Personal workspace\n`);
            fixedCount++;
          } else {
            console.log(`   🔄 Would switch to Personal workspace (DRY RUN)\n`);
            fixedCount++;
          }
        } else {
          // No Personal workspace found - create one
          console.log(`   ⚠️  No Personal workspace found - creating emergency workspace`);

          if (!DRY_RUN) {
            try {
              // Create emergency Personal workspace
              const emergencyOrg = await prisma.organization.create({
                data: {
                  name: 'Private Workspace',
                  isPersonal: true,
                  plan: 'FREE',
                },
              });

              // Create membership
              await prisma.organizationMember.create({
                data: {
                  userId: user.id,
                  organizationId: emergencyOrg.id,
                  role: 'ORG_OWNER',
                },
              });

              // Update user
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  organizationId: emergencyOrg.id,
                  role: 'ORG_OWNER',
                },
              });

              fixes.push({
                userId: user.id,
                email: user.email,
                oldOrgId: user.organizationId,
                newOrgId: emergencyOrg.id,
                newOrgName: emergencyOrg.name,
                emergencyCreated: true,
              });

              console.log(`   ✅ Created and switched to emergency Personal workspace\n`);
              fixedCount++;
            } catch (error) {
              console.error(`   ❌ Failed to create emergency workspace:`, error.message);
              errorCount++;
            }
          } else {
            console.log(`   ✅ Would create emergency Personal workspace (DRY RUN)\n`);
            fixedCount++;
          }
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total users checked: ${usersWithOrgs.length}`);
    console.log(`Users in deleted orgs: ${fixedCount}`);
    console.log(`Successfully fixed: ${DRY_RUN ? '0 (DRY RUN)' : fixedCount}`);
    console.log(`Errors: ${errorCount}`);

    if (fixes.length > 0 && !DRY_RUN) {
      console.log('\n📝 Fixed Users:');
      fixes.forEach((fix, index) => {
        console.log(`\n${index + 1}. ${fix.email || fix.userId}`);
        console.log(`   Old Org: ${fix.oldOrgId} (DELETED)`);
        console.log(`   New Org: ${fix.newOrgName} (${fix.newOrgId})`);
        if (fix.emergencyCreated) {
          console.log(`   ⚠️  Emergency workspace created`);
        }
      });
    }

    if (DRY_RUN && fixedCount > 0) {
      console.log('\n💡 Run without DRY_RUN=true to apply fixes');
    }

    console.log('\n✅ Migration complete!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
