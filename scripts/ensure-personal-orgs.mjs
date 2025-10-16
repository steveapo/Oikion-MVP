import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function ensurePersonalOrganizations() {
  try {
    console.log('🔍 Checking for users without personal organizations...\n');
    
    // Get all users
    const allUsers = await prisma.user.findMany({
      include: {
        organization: true,
      },
    });
    
    console.log(`Found ${allUsers.length} total users\n`);
    
    // Get all organizations to check which are personal
    const allOrgs = await prisma.organization.findMany({
      include: {
        users: true,
      },
    });
    
    let fixed = 0;
    let created = 0;
    
    for (const user of allUsers) {
      // Check if user has a personal organization
      const personalOrg = allOrgs.find(org => 
        org.isPersonal && org.users.some(u => u.id === user.id)
      );
      
      if (!personalOrg) {
        console.log(`❌ User ${user.email} (${user.id}) has NO personal organization`);
        
        // Check if user already has a membership to ANY personal workspace
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
          console.log(`   ℹ️  User already has personal workspace membership: ${existingPersonalMembership.organization.name}`);
          
          // If user has no organizationId, set it to their personal workspace
          if (!user.organizationId) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                organizationId: existingPersonalMembership.organization.id,
                role: user.role === 'AGENT' ? 'ORG_OWNER' : user.role,
              },
            });
            fixed++;
            console.log(`   ✅ Set user's active organization to their personal workspace\n`);
          }
          continue;
        }
        
        // Create personal organization
        const newPersonalOrg = await prisma.organization.create({
          data: {
            name: 'Private Workspace',
            isPersonal: true,
            plan: "FREE",
          },
        });
        
        created++;
        console.log(`   ✅ Created personal org: ${newPersonalOrg.name} (${newPersonalOrg.id})`);
        
        // If user has no organization at all, assign them to their personal org
        if (!user.organizationId) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              organizationId: newPersonalOrg.id,
              role: user.role === 'AGENT' ? 'ORG_OWNER' : user.role,
            },
          });
          
          fixed++;
          console.log(`   ✅ Assigned user to their personal org\n`);
        } else {
          console.log(`   ℹ️  User already has org ${user.organization?.name}, personal org available for switching\n`);
        }
      } else {
        console.log(`✅ User ${user.email} already has personal org: ${personalOrg.name}`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`📊 Summary:`);
    console.log(`   - Total users: ${allUsers.length}`);
    console.log(`   - Personal orgs created: ${created}`);
    console.log(`   - Users assigned to new personal orgs: ${fixed}`);
    console.log('='.repeat(60) + '\n');
    
    if (created === 0) {
      console.log('✅ All users already have personal organizations!');
    } else {
      console.log('✅ All users now have personal organizations!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ensurePersonalOrganizations();
