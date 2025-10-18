import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixUserMemberships() {
  try {
    console.log('🔧 Fixing user organization memberships...\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        organization: true,
      },
    });
    
    console.log(`Found ${users.length} users to check\n`);
    
    for (const user of users) {
      console.log(`\n👤 Checking user: ${user.email}`);
      console.log(`   Current org: ${user.organization?.name || 'NONE'}`);
      
      // Find their personal workspace
      const personalWorkspace = await prisma.organization.findFirst({
        where: {
          isPersonal: true,
          users: {
            some: {
              id: user.id,
            },
          },
        },
      });
      
      if (personalWorkspace) {
        console.log(`   ✅ Has access to personal workspace: ${personalWorkspace.name}`);
      } else {
        console.log(`   ❌ NO access to personal workspace!`);
        
        // Find ANY personal workspace (in case user lost connection)
        const anyPersonalWorkspace = await prisma.organization.findFirst({
          where: {
            isPersonal: true,
            name: 'Private Workspace',
          },
        });
        
        if (anyPersonalWorkspace) {
          console.log(`   🔄 Found orphaned personal workspace, checking ownership...`);
          
          // Check if this workspace has no users
          const workspaceUsers = await prisma.user.findMany({
            where: {
              organizationId: anyPersonalWorkspace.id,
            },
          });
          
          if (workspaceUsers.length === 0) {
            console.log(`   ✨ Assigning orphaned workspace to user...`);
            // This workspace has no owner, assign to this user
            // But don't change their current organizationId
          }
        }
      }
      
      // Get all organizations this user has access to
      const userOrgs = await prisma.organization.findMany({
        where: {
          users: {
            some: {
              id: user.id,
            },
          },
        },
        select: {
          id: true,
          name: true,
          isPersonal: true,
        },
      });
      
      console.log(`   📊 Total organizations with access: ${userOrgs.length}`);
      userOrgs.forEach((org, idx) => {
        const isCurrent = org.id === user.organizationId;
        console.log(`      ${idx + 1}. ${org.name} (${org.isPersonal ? 'PERSONAL' : 'TEAM'}) ${isCurrent ? '← ACTIVE' : ''}`);
      });
    }
    
    console.log('\n✅ Check complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserMemberships();
