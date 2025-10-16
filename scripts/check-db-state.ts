import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log("🔍 Checking database state...\n");

    // Check RLS status
    const rlsStatus = await prisma.$queryRaw<Array<{
      tablename: string;
      rowsecurity: boolean;
    }>>`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('properties', 'clients', 'tasks', 'activities', 'addresses', 'listings', 'media_assets', 'interactions', 'notes', 'client_relationships')
      ORDER BY tablename;
    `;

    console.log("📊 RLS Status:");
    rlsStatus.forEach(row => {
      console.log(`  ${row.rowsecurity ? '✅' : '❌'} ${row.tablename}: ${row.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
    });

    // Check user privileges
    const userPrivs = await prisma.$queryRaw<Array<{
      rolname: string;
      rolsuper: boolean;
      rolbypassrls: boolean;
    }>>`
      SELECT rolname, rolsuper, rolbypassrls 
      FROM pg_roles 
      WHERE rolname = current_user;
    `;

    console.log("\n👤 Current Database User Privileges:");
    userPrivs.forEach(row => {
      console.log(`  User: ${row.rolname}`);
      console.log(`  ${row.rolsuper ? '⚠️  SUPERUSER' : '✅ Not superuser'}`);
      console.log(`  ${row.rolbypassrls ? '⚠️  BYPASSRLS (RLS policies will NOT work!)' : '✅ No BYPASSRLS privilege'}`);
    });

    // Check policies
    const policies = await prisma.$queryRaw<Array<{
      tablename: string;
      policyname: string;
      cmd: string;
    }>>`
      SELECT 
        schemaname || '.' || tablename as tablename,
        policyname,
        cmd
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;

    console.log("\n🔐 Existing RLS Policies:");
    if (policies.length === 0) {
      console.log("  ❌ No policies found!");
    } else {
      const grouped = policies.reduce((acc, p) => {
        if (!acc[p.tablename]) acc[p.tablename] = [];
        acc[p.tablename].push(`${p.policyname} (${p.cmd})`);
        return acc;
      }, {} as Record<string, string[]>);

      Object.entries(grouped).forEach(([table, pols]) => {
        console.log(`  ${table}:`);
        pols.forEach(pol => console.log(`    - ${pol}`));
      });
    }

    // Check organizations and users
    const orgCount = await prisma.organization.count();
    const userCount = await prisma.user.count();
    const usersWithOrg = await prisma.user.count({ where: { organizationId: { not: null } } });

    console.log("\n📈 Data State:");
    console.log(`  Organizations: ${orgCount}`);
    console.log(`  Users: ${userCount} (${usersWithOrg} with org assigned)`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
