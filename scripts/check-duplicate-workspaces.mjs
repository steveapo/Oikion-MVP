import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDuplicatePersonalWorkspaces() {
  try {
    console.log('🔍 Checking for duplicate personal workspaces...\n');
    
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
      },
    });
    
    console.log(`Found ${users.length} users\n`);
    
    for (const user of users) {
      // Get all memberships for this user
      const memberships = await prisma.organizationMember.findMany({
        where: {
          userId: user.id,
        },
        include: {
          organization: true,
        },
        orderBy: [
          { organization: { isPersonal: 'desc' } },
          { organization: { createdAt: 'desc' } },
        ],
      });
      
      const personalWorkspaces = memberships.filter(m => m.organization.isPersonal);
      
      if (personalWorkspaces.length > 1) {
        console.log(`❌ ${user.email} has ${personalWorkspaces.length} personal workspaces!`);
        personalWorkspaces.forEach((pw, idx) => {
          console.log(`   ${idx + 1}. ${pw.organization.name} (ID: ${pw.organization.id})`);
          console.log(`      Created: ${pw.organization.createdAt}`);
          console.log(`      Membership ID: ${pw.id}`);
        });
        console.log();
      } else if (personalWorkspaces.length === 1) {
        console.log(`✅ ${user.email} has 1 personal workspace: ${personalWorkspaces[0].organization.name}`);
      } else {
        console.log(`⚠️  ${user.email} has NO personal workspace!`);
      }
    }
    
    // Check for orphaned personal workspaces
    console.log('\n' + '='.repeat(60));
    console.log('🔍 Checking for orphaned personal workspaces...\n');
    
    const allPersonalWorkspaces = await prisma.organization.findMany({
      where: {
        isPersonal: true,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });
    
    console.log(`Found ${allPersonalWorkspaces.length} total personal workspaces\n`);
    
    allPersonalWorkspaces.forEach((org, idx) => {
      console.log(`${idx + 1}. ${org.name} (ID: ${org.id})`);
      console.log(`   Members: ${org.members.length}`);
      if (org.members.length > 0) {
        org.members.forEach(m => {
          console.log(`   - ${m.user.email}`);
        });
      } else {
        console.log(`   ⚠️  NO MEMBERS (orphaned)`);
      }
      console.log();
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicatePersonalWorkspaces();
