import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateWorkspaces() {
  try {
    console.log('🧹 Cleaning up duplicate personal workspaces...\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });
    
    for (const user of users) {
      // Get all personal workspace memberships for this user
      const personalMemberships = await prisma.organizationMember.findMany({
        where: {
          userId: user.id,
          organization: {
            isPersonal: true,
          },
        },
        include: {
          organization: true,
        },
        orderBy: {
          joinedAt: 'asc', // Keep the oldest one (first created)
        },
      });
      
      if (personalMemberships.length > 1) {
        console.log(`\n🔧 ${user.email} has ${personalMemberships.length} personal workspaces`);
        
        // Keep the first (oldest) personal workspace
        const keepWorkspace = personalMemberships[0];
        const duplicates = personalMemberships.slice(1);
        
        console.log(`   ✅ Keeping: ${keepWorkspace.organization.name} (${keepWorkspace.organization.id})`);
        console.log(`   ❌ Removing ${duplicates.length} duplicate(s):`);
        
        for (const dup of duplicates) {
          console.log(`      - ${dup.organization.name} (${dup.organization.id})`);
          
          // Delete the membership
          await prisma.organizationMember.delete({
            where: {
              id: dup.id,
            },
          });
          
          // Check if this organization has any other members
          const otherMembers = await prisma.organizationMember.findMany({
            where: {
              organizationId: dup.organization.id,
            },
          });
          
          if (otherMembers.length === 0) {
            // No other members, safe to delete the organization
            console.log(`      → Deleting orphaned organization ${dup.organization.id}`);
            await prisma.organization.delete({
              where: {
                id: dup.organization.id,
              },
            });
          } else {
            console.log(`      → Organization has ${otherMembers.length} other members, keeping it`);
          }
        }
        
        console.log(`   ✅ Cleanup complete for ${user.email}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Duplicate personal workspace cleanup complete!\n');
    
    // Verify the fix
    console.log('🔍 Verifying...\n');
    for (const user of users) {
      const personalCount = await prisma.organizationMember.count({
        where: {
          userId: user.id,
          organization: {
            isPersonal: true,
          },
        },
      });
      
      if (personalCount === 1) {
        console.log(`✅ ${user.email}: 1 personal workspace`);
      } else if (personalCount === 0) {
        console.log(`⚠️  ${user.email}: NO personal workspace`);
      } else {
        console.log(`❌ ${user.email}: ${personalCount} personal workspaces (STILL DUPLICATE!)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateWorkspaces();
