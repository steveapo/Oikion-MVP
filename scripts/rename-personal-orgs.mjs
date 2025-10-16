import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function renamePersonalOrganizations() {
  try {
    console.log('🔄 Renaming all personal organizations to "Private Workspace"...\n');
    
    const result = await prisma.organization.updateMany({
      where: {
        isPersonal: true,
      },
      data: {
        name: 'Private Workspace',
      },
    });
    
    console.log(`✅ Updated ${result.count} personal organizations\n`);
    
    // Verify the changes
    const personalOrgs = await prisma.organization.findMany({
      where: {
        isPersonal: true,
      },
      include: {
        users: {
          select: {
            email: true,
          },
        },
      },
    });
    
    console.log('📊 All Personal Organizations:');
    personalOrgs.forEach((org, idx) => {
      const userEmails = org.users.map(u => u.email).join(', ');
      console.log(`  ${idx + 1}. "${org.name}" - Users: ${userEmails}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

renamePersonalOrganizations();
