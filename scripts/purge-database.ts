import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function purgeDatabase() {
  console.log('🗑️  Starting database purge...\n');

  try {
    // Delete in reverse order of dependencies to avoid foreign key constraints
    
    console.log('Deleting activities...');
    const activities = await prisma.activity.deleteMany({});
    console.log(`✓ Deleted ${activities.count} activities`);

    console.log('Deleting notes...');
    const notes = await prisma.note.deleteMany({});
    console.log(`✓ Deleted ${notes.count} notes`);

    console.log('Deleting tasks...');
    const tasks = await prisma.task.deleteMany({});
    console.log(`✓ Deleted ${tasks.count} tasks`);

    console.log('Deleting interactions...');
    const interactions = await prisma.interaction.deleteMany({});
    console.log(`✓ Deleted ${interactions.count} interactions`);

    console.log('Deleting client relationships...');
    const clientRelationships = await prisma.clientRelationship.deleteMany({});
    console.log(`✓ Deleted ${clientRelationships.count} client relationships`);

    console.log('Deleting clients...');
    const clients = await prisma.client.deleteMany({});
    console.log(`✓ Deleted ${clients.count} clients`);

    console.log('Deleting media assets...');
    const mediaAssets = await prisma.mediaAsset.deleteMany({});
    console.log(`✓ Deleted ${mediaAssets.count} media assets`);

    console.log('Deleting listings...');
    const listings = await prisma.listing.deleteMany({});
    console.log(`✓ Deleted ${listings.count} listings`);

    console.log('Deleting addresses...');
    const addresses = await prisma.address.deleteMany({});
    console.log(`✓ Deleted ${addresses.count} addresses`);

    console.log('Deleting properties...');
    const properties = await prisma.property.deleteMany({});
    console.log(`✓ Deleted ${properties.count} properties`);

    console.log('Deleting sessions...');
    const sessions = await prisma.session.deleteMany({});
    console.log(`✓ Deleted ${sessions.count} sessions`);

    console.log('Deleting accounts...');
    const accounts = await prisma.account.deleteMany({});
    console.log(`✓ Deleted ${accounts.count} accounts`);

    console.log('Deleting verification tokens...');
    const verificationTokens = await prisma.verificationToken.deleteMany({});
    console.log(`✓ Deleted ${verificationTokens.count} verification tokens`);

    console.log('Deleting users...');
    const users = await prisma.user.deleteMany({});
    console.log(`✓ Deleted ${users.count} users`);

    console.log('Deleting organizations...');
    const organizations = await prisma.organization.deleteMany({});
    console.log(`✓ Deleted ${organizations.count} organizations`);

    console.log('\n✅ Database purge completed successfully!');
    console.log('You can now re-register with your email addresses.\n');

  } catch (error) {
    console.error('❌ Error purging database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

purgeDatabase()
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
