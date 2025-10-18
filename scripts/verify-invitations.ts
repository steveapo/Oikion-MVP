import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyInvitationsTable() {
  try {
    console.log("🔍 Verifying invitations table...\n");

    // Check if table exists
    const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'invitations'
      );
    `;

    if (tableExists[0].exists) {
      console.log("✅ Invitations table exists");

      // Check columns
      const columns = await prisma.$queryRaw<Array<{
        column_name: string;
        data_type: string;
      }>>`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'invitations'
        ORDER BY ordinal_position;
      `;

      console.log("\n📋 Table columns:");
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });

      // Test basic operation
      const count = await prisma.invitation.count();
      console.log(`\n📊 Current invitation count: ${count}`);
      
      console.log("\n✅ Invitation system is ready!");
    } else {
      console.log("❌ Invitations table does NOT exist");
    }

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyInvitationsTable();
