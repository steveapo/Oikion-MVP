import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function populateMemberships() {
  try {
    console.log('🔄 Populating organization memberships...\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      include: {
        organization: true,
      },
    });
    
    console.log(`Found ${users.length} users\n`);
    
    for (const user of users) {
      console.log(`\n👤 Processing: ${user.email}`);
      console.log(`   Current org: ${user.organization?.name || 'NONE'}`);
      
      // 1. Find or create their personal workspace
      let personalWorkspace = await prisma.organization.findFirst({
        where: {
          isPersonal: true,
          name: 'Private Workspace',
          // Find an orphaned one OR create new
        },
      });
      
      // Check if this user already has a personal workspace in memberships
      const existingPersonalMembership = await prisma.organizationMember.findFirst({
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
      
      if (existingPersonalMembership) {
        personalWorkspace = existingPersonalMembership.organization;
        console.log(`   ✅ Already has personal workspace membership: ${personalWorkspace.name}`);
      } else {
        // Find an orphaned personal workspace (one with no members)
        const orphanedWorkspaces = await prisma.organization.findMany({
          where: {
            isPersonal: true,
            name: 'Private Workspace',
          },
          include: {
            members: true,
          },
        });
        
        const orphaned = orphanedWorkspaces.find(org => org.members.length === 0);
        
        if (orphaned) {
          personalWorkspace = orphaned;
          console.log(`   ♻️  Found orphaned workspace: ${orphaned.id}`);
        } else {
          // Create new personal workspace
          personalWorkspace = await prisma.organization.create({
            data: {
              name: 'Private Workspace',
              isPersonal: true,
              plan: 'FREE',
            },
          });
          console.log(`   ✨ Created new personal workspace: ${personalWorkspace.id}`);
        }
        
        // Add membership
        await prisma.organizationMember.create({
          data: {
            userId: user.id,
            organizationId: personalWorkspace.id,
            role: 'ORG_OWNER',
          },
        });
        console.log(`   ✅ Added membership to personal workspace`);
      }
      
      // 2. Add membership to their current organization (if different and exists)
      if (user.organizationId && user.organizationId !== personalWorkspace.id) {
        const existingMembership = await prisma.organizationMember.findUnique({
          where: {
            userId_organizationId: {
              userId: user.id,
              organizationId: user.organizationId,
            },
          },
        });
        
        if (!existingMembership) {
          await prisma.organizationMember.create({
            data: {
              userId: user.id,
              organizationId: user.organizationId,
              role: user.role,
            },
          });
          console.log(`   ✅ Added membership to current org: ${user.organization?.name}`);
        } else {
          console.log(`   ✅ Already has membership in: ${user.organization?.name}`);
        }
      }
    }
    
    // Verify results
    console.log('\n' + '='.repeat(60));
    console.log('📊 Final Membership Summary:\n');
    
    for (const user of users) {
      const memberships = await prisma.organizationMember.findMany({
        where: {
          userId: user.id,
        },
        include: {
          organization: true,
        },
      });
      
      console.log(`👤 ${user.email}:`);
      memberships.forEach((m, idx) => {
        const isCurrent = m.organizationId === user.organizationId;
        console.log(`   ${idx + 1}. ${m.organization.name} (${m.organization.isPersonal ? 'PERSONAL' : 'TEAM'}) - ${m.role} ${isCurrent ? '← ACTIVE' : ''}`);
      });
    }
    
    console.log('\n✅ Membership population complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateMemberships();
